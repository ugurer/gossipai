from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List, Dict, Any
import shutil
import os
from pathlib import Path
from core.pdf_processor import PDFProcessor
from core.vector_db import VectorDB
from core.db_manager import DBManager
from core.logger import logger
from sentence_transformers import SentenceTransformer
import numpy as np
from dotenv import load_dotenv
import torch
import gc
import asyncio
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

router = APIRouter(prefix="/documents", tags=["documents"])
pdf_processor = PDFProcessor()
db_manager = DBManager()
executor = ThreadPoolExecutor(max_workers=1)

# Model yükleme işlemini try-except bloğu içine alalım
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
    model = model.to(device)
    logger.info(f"Model yüklendi: {model.__class__.__name__} ({device})")
except Exception as e:
    logger.error(f"Model yükleme hatası: {str(e)}")
    model = None

# Geçici dosya dizini oluştur
UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', './data/uploads'))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Maksimum dosya boyutu (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes

def process_chunk(chunk: str) -> np.ndarray:
    """Tek bir chunk'ı işle"""
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Embedding modeli yüklenemedi"
        )
    
    try:
        with torch.no_grad():
            vector = model.encode([chunk], convert_to_numpy=True)[0]
        return vector
    except Exception as e:
        logger.error(f"Chunk işleme hatası: {str(e)}")
        raise

async def process_document(file_path: str, file_name: str):
    """Dokümanı arka planda işle"""
    try:
        # PDF'i işle
        doc_info = pdf_processor.process_pdf(file_path)
        logger.info(f"PDF işlendi: {file_name}")
        
        # Metin parçalarını oluştur
        chunks = list(pdf_processor.chunk_text(doc_info['content']))
        total_chunks = len(chunks)
        logger.info(f"Toplam chunk sayısı: {total_chunks}")
        
        # Her chunk'ı ayrı ayrı işle
        for i, chunk in enumerate(chunks):
            try:
                # Chunk'ı işle
                loop = asyncio.get_event_loop()
                vector = await loop.run_in_executor(executor, process_chunk, chunk)
                
                # Metadata oluştur
                chunk_metadata = {
                    'chunk_index': i,
                    'document_hash': doc_info['file_hash'],
                    'document_title': doc_info['metadata']['title'] or file_name,
                    'text': chunk
                }
                
                # Vektör veritabanına ekle
                db_manager.vector_db.add_vectors(np.array([vector]), [chunk_metadata])
                logger.info(f"Chunk işlendi: {i+1}/{total_chunks}")
                
                # Belleği temizle
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                # Her 10 chunk'ta bir veritabanını kaydet
                if (i + 1) % 10 == 0:
                    db_manager.save_db()
                    logger.info(f"Ara kayıt yapıldı: {i+1}/{total_chunks}")
                
            except Exception as e:
                logger.error(f"Chunk {i+1} işlenirken hata: {str(e)}")
                continue
        
        # Son durumu kaydet
        db_manager.save_db()
        logger.info(f"İşlem tamamlandı: {file_name}")
        
    except Exception as e:
        logger.error(f"Doküman işleme hatası: {str(e)}")
    finally:
        # Geçici dosyayı temizle
        try:
            os.remove(file_path)
        except:
            pass

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """PDF dosyası yükle ve arka planda işle"""
    try:
        # Dosya türü kontrolü
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Sadece PDF dosyaları kabul edilir"
            )
        
        # Dosya boyutu kontrolü
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Dosya boyutu çok büyük. Maksimum boyut: {MAX_FILE_SIZE/1024/1024}MB"
            )
        
        # Geçici dosyayı kaydet
        temp_path = UPLOAD_DIR / file.filename
        with temp_path.open("wb") as buffer:
            buffer.write(content)
        
        logger.info(f"Dosya yüklendi: {file.filename}")
        
        # Arka plan işlemi başlat
        background_tasks.add_task(
            process_document,
            str(temp_path),
            file.filename
        )
        
        return {
            "status": "success",
            "message": "Doküman yüklendi ve işleme alındı",
            "file_name": file.filename
        }
    
    except Exception as e:
        logger.error(f"Dosya yükleme hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Dosya yüklenirken bir hata oluştu: {str(e)}"
        )

@router.post("/search")
async def search_documents(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Metin sorgusu ile benzer doküman parçalarını ara"""
    try:
        # Sorguyu vektöre dönüştür
        query_vector = model.encode([query])[0]
        
        # Benzer vektörleri ara
        results = db_manager.vector_db.search(query_vector, k=limit)
        
        return [{
            "similarity": float(score),
            "content": metadata['text'],
            "document_title": metadata['document_title'],
            "chunk_index": metadata['chunk_index']
        } for score, metadata in results]
    
    except Exception as e:
        logger.error(f"Arama hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Arama sırasında bir hata oluştu: {str(e)}"
        )

@router.get("/list")
async def list_documents() -> List[Dict[str, Any]]:
    """İşlenmiş dokümanların listesini getir"""
    try:
        documents = {}
        for metadata in db_manager.vector_db.metadata_store.values():
            doc_hash = metadata['document_hash']
            if doc_hash not in documents:
                documents[doc_hash] = {
                    'title': metadata['document_title'],
                    'hash': doc_hash,
                    'chunk_count': 1
                }
            else:
                documents[doc_hash]['chunk_count'] += 1
        
        return list(documents.values())
    
    except Exception as e:
        logger.error(f"Doküman listesi hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Doküman listesi alınırken bir hata oluştu: {str(e)}"
        ) 