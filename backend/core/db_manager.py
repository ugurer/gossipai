import os
from pathlib import Path
from typing import Optional
from .vector_db import VectorDB
from dotenv import load_dotenv

load_dotenv()

class DBManager:
    _instance: Optional['DBManager'] = None
    _vector_db: Optional[VectorDB] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DBManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Veritabanını başlat veya yükle"""
        db_path = os.getenv('VECTOR_DB_PATH', './data/vector_db')
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        if os.path.exists(f"{db_path}.index"):
            print("Mevcut vektör veritabanı yükleniyor...")
            self._vector_db = VectorDB.load(db_path)
        else:
            print("Yeni vektör veritabanı oluşturuluyor...")
            self._vector_db = VectorDB()

    @property
    def vector_db(self) -> VectorDB:
        """Vektör veritabanı örneğini döndür"""
        if self._vector_db is None:
            self._initialize()
        return self._vector_db

    def save_db(self):
        """Vektör veritabanını diske kaydet"""
        if self._vector_db:
            db_path = os.getenv('VECTOR_DB_PATH', './data/vector_db')
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            self._vector_db.save(db_path)
            print("Vektör veritabanı kaydedildi.") 