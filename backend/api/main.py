from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from api.routers import documents, qa
from core.backup_manager import BackupManager
from core.logger import logger

app = FastAPI(
    title="Hukuki AI API",
    description="AI Destekli Hukuki Danışman Sistemi API",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Prod ortamında spesifik originler tanımlanmalı
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(documents.router)
app.include_router(qa.router)

# Yedekleme yöneticisini başlat
backup_manager = BackupManager()

@app.on_event("startup")
async def startup_event():
    """Uygulama başlatıldığında çalışacak işlemler"""
    try:
        backup_manager.start()
        logger.info("Uygulama başlatıldı ve yedekleme sistemi aktif")
    except Exception as e:
        logger.error(f"Başlatma hatası: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Uygulama kapatıldığında çalışacak işlemler"""
    try:
        backup_manager.stop()
        logger.info("Uygulama ve yedekleme sistemi kapatıldı")
    except Exception as e:
        logger.error(f"Kapatma hatası: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Hukuki AI API'ye Hoş Geldiniz"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 