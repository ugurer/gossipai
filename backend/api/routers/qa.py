from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel, Field
import google.cloud.aiplatform as aiplatform
from sentence_transformers import SentenceTransformer
from core.db_manager import DBManager
from core.logger import logger
import os
import torch
import numpy as np
from dotenv import load_dotenv
import gc

load_dotenv()

router = APIRouter(prefix="/qa", tags=["question-answering"])
db_manager = DBManager()

# Model yükleme işlemini try-except bloğu içine alalım
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
    model = model.to(device)
    logger.info(f"Model yüklendi: {model.__class__.__name__} ({device})")
except Exception as e:
    logger.error(f"Model yükleme hatası: {str(e)}")
    model = None

# Google Cloud API yapılandırması
try:
    aiplatform.init(
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION"),
        api_key=os.getenv("GOOGLE_API_KEY")
    )
except Exception as e:
    logger.error(f"Google Cloud API yapılandırma hatası: {str(e)}")

def create_embedding(text: str) -> np.ndarray:
    """Metni vektöre dönüştür"""
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Embedding modeli yüklenemedi"
        )
    
    try:
        with torch.no_grad():
            vector = model.encode([text], convert_to_numpy=True)[0]
        return vector
    except Exception as e:
        logger.error(f"Vektör oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Vektör oluşturma hatası: {str(e)}"
        )

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=10, max_length=1000)
    context_size: int = Field(default=3, ge=1, le=10)

    class Config:
        schema_extra = {
            "example": {
                "question": "İş sözleşmesinin feshi için gerekli şartlar nelerdir?",
                "context_size": 3
            }
        }

@router.post("/ask")
async def ask_question(request: QuestionRequest) -> Dict[str, Any]:
    """Hukuki soru-cevap işlemi"""
    try:
        logger.info(f"Yeni soru alındı: {request.question}")
        
        # Soruyu vektöre dönüştür
        try:
            with torch.no_grad():
                query_vector = model.encode([request.question], convert_to_numpy=True)[0]
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception as e:
            logger.error(f"Soru vektörü oluşturma hatası: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Soru işlenirken bir hata oluştu"
            )
        
        # İlgili doküman parçalarını bul
        try:
            results = db_manager.vector_db.search(query_vector, k=request.context_size)
        except Exception as e:
            logger.error(f"Arama hatası: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Benzer dokümanlar aranırken bir hata oluştu"
            )
        
        if not results:
            logger.warning("Soru için ilgili bağlam bulunamadı")
            return {
                "answer": "Üzgünüm, bu soru için ilgili bir bağlam bulamadım.",
                "context": []
            }
        
        # Bağlamı hazırla
        context = "\n".join([metadata['text'] for _, metadata in results])
        logger.info(f"Bağlam bulundu: {len(results)} parça")
        
        # Gemini prompt'unu hazırla
        prompt = f"""Sen bir hukuk uzmanısın. Aşağıdaki bağlamı kullanarak soruyu cevaplamalısın.
        Eğer bağlamda yeterli bilgi yoksa, bunu belirtmelisin.
        
        Bağlam:
        {context}
        
        Soru: {request.question}
        
        Lütfen açık, net ve profesyonel bir şekilde yanıtla. 
        Cevabını maddeler halinde ver ve önemli noktaları vurgula.
        Eğer bağlamda eksik bilgi varsa, bunu belirt."""
        
        try:
            # Gemini'yi yapılandır ve yanıt al
            model = aiplatform.GenerativeModel("gemini-pro")
            response = model.generate_content(prompt)
            logger.info("Gemini'den yanıt alındı")
            
            # Belleği temizle
            gc.collect()
            
            return {
                "answer": response.text,
                "context": [{
                    "text": metadata['text'],
                    "document_title": metadata['document_title'],
                    "similarity": float(score)
                } for score, metadata in results]
            }
            
        except Exception as e:
            logger.error(f"Gemini API hatası: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="AI servisi şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin."
            )
        
    except Exception as e:
        logger.error(f"Soru-cevap işlemi hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Soru cevaplanırken bir hata oluştu: {str(e)}"
        )

@router.get("/recent")
async def get_recent_questions() -> List[Dict[str, Any]]:
    """Son sorulan soruları getir"""
    try:
        # Bu özellik şimdilik dummy data döndürüyor
        # İleride veritabanı entegrasyonu yapılacak
        return [
            {
                "id": 1,
                "question": "İş sözleşmesinin feshi için gerekli şartlar nelerdir?",
                "timestamp": "2024-03-21T10:00:00Z"
            }
        ]
    except Exception as e:
        logger.error(f"Son sorular alınırken hata: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Son sorular alınırken bir hata oluştu"
        ) 