import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional
import schedule
import time
import threading
from .db_manager import DBManager
from .logger import logger

class BackupManager:
    _instance: Optional['BackupManager'] = None
    _backup_thread: Optional[threading.Thread] = None
    _should_stop = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BackupManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Yedekleme dizinini oluştur ve zamanlamayı ayarla"""
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.db_manager = DBManager()

        # Her gün gece yarısı yedekleme yap
        schedule.every().day.at("00:00").do(self._create_backup)
        
        # Her hafta pazar günü eski yedekleri temizle
        schedule.every().sunday.at("01:00").do(self._cleanup_old_backups)

    def start(self):
        """Yedekleme zamanlamasını başlat"""
        if self._backup_thread is None:
            self._should_stop = False
            self._backup_thread = threading.Thread(target=self._run_scheduler)
            self._backup_thread.daemon = True
            self._backup_thread.start()
            logger.info("Yedekleme zamanlaması başlatıldı")

    def stop(self):
        """Yedekleme zamanlamasını durdur"""
        self._should_stop = True
        if self._backup_thread:
            self._backup_thread.join()
            self._backup_thread = None
            logger.info("Yedekleme zamanlaması durduruldu")

    def _run_scheduler(self):
        """Zamanlama döngüsünü çalıştır"""
        while not self._should_stop:
            schedule.run_pending()
            time.sleep(60)

    def _create_backup(self):
        """Vektör veritabanının yedeğini oluştur"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.backup_dir / f"vector_db_backup_{timestamp}"
            
            # Veritabanını kaydet
            self.db_manager.save_db()
            
            # Veritabanı dosyalarını yedekle
            db_path = Path(os.getenv('VECTOR_DB_PATH', './data/vector_db'))
            for ext in ['.index', '.metadata']:
                src = f"{db_path}{ext}"
                dst = f"{backup_path}{ext}"
                if os.path.exists(src):
                    shutil.copy2(src, dst)
            
            logger.info(f"Yedekleme oluşturuldu: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Yedekleme oluşturulurken hata: {str(e)}")
            return False

    def _cleanup_old_backups(self, keep_days: int = 30):
        """Eski yedekleri temizle"""
        try:
            current_time = datetime.now().timestamp()
            for backup_file in self.backup_dir.glob("vector_db_backup_*"):
                file_age = current_time - os.path.getctime(backup_file)
                if file_age > (keep_days * 24 * 60 * 60):
                    backup_file.unlink()
                    logger.info(f"Eski yedek silindi: {backup_file}")
        except Exception as e:
            logger.error(f"Eski yedekler temizlenirken hata: {str(e)}")

    def restore_backup(self, backup_timestamp: str) -> bool:
        """Belirli bir yedeği geri yükle"""
        try:
            backup_path = self.backup_dir / f"vector_db_backup_{backup_timestamp}"
            db_path = Path(os.getenv('VECTOR_DB_PATH', './data/vector_db'))
            
            # Mevcut veritabanını yedekle
            self._create_backup()
            
            # Yedeği geri yükle
            for ext in ['.index', '.metadata']:
                src = f"{backup_path}{ext}"
                dst = f"{db_path}{ext}"
                if os.path.exists(src):
                    shutil.copy2(src, dst)
            
            # Veritabanını yeniden yükle
            self.db_manager._initialize()
            
            logger.info(f"Yedek geri yüklendi: {backup_timestamp}")
            return True
        except Exception as e:
            logger.error(f"Yedek geri yüklenirken hata: {str(e)}")
            return False

    def list_backups(self):
        """Mevcut yedekleri listele"""
        try:
            backups = []
            for backup_file in self.backup_dir.glob("vector_db_backup_*.index"):
                timestamp = backup_file.stem.replace("vector_db_backup_", "")
                size = os.path.getsize(backup_file)
                created = datetime.fromtimestamp(os.path.getctime(backup_file))
                backups.append({
                    "timestamp": timestamp,
                    "size": size,
                    "created": created.isoformat()
                })
            return sorted(backups, key=lambda x: x["created"], reverse=True)
        except Exception as e:
            logger.error(f"Yedekler listelenirken hata: {str(e)}")
            return [] 