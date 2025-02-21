from PyPDF2 import PdfReader
from typing import Dict, List, Any
import hashlib
from datetime import datetime

class PDFProcessor:
    def __init__(self):
        self.processed_docs = {}
        
    def process_pdf(self, file_path: str) -> Dict[str, Any]:
        """PDF dosyasını işler ve metin + metadata çıkarır."""
        
        # PDF'i oku
        with open(file_path, 'rb') as file:
            # Dosya hash'i hesapla
            file_hash = hashlib.md5(file.read()).hexdigest()
            file.seek(0)
            
            reader = PdfReader(file)
            
            # Metadata çıkar
            metadata = {
                'title': reader.metadata.get('/Title', ''),
                'author': reader.metadata.get('/Author', ''),
                'creation_date': reader.metadata.get('/CreationDate', ''),
                'pages': len(reader.pages),
                'file_hash': file_hash,
                'processed_at': datetime.now().isoformat()
            }
            
            # Metin çıkar
            text_content = []
            for page in reader.pages:
                text_content.append(page.extract_text())
                
            # Sonuçları hazırla
            result = {
                'metadata': metadata,
                'content': text_content,
                'file_hash': file_hash
            }
            
            # Cache'e kaydet
            self.processed_docs[file_hash] = result
            
            return result
    
    def get_cached_doc(self, file_hash: str) -> Dict[str, Any]:
        """Cache'den doküman bilgilerini getirir."""
        return self.processed_docs.get(file_hash)
    
    def chunk_text(self, text: List[str], chunk_size: int = 1000, 
                  overlap: int = 200) -> List[str]:
        """Metni örtüşen parçalara böler."""
        chunks = []
        for page in text:
            words = page.split()
            for i in range(0, len(words), chunk_size - overlap):
                chunk = ' '.join(words[i:i + chunk_size])
                if chunk:
                    chunks.append(chunk)
        return chunks 