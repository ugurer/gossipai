import logging
from pathlib import Path
import sys

# Log dizinini oluştur
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Logger'ı yapılandır
logger = logging.getLogger("hukuki_ai")
logger.setLevel(logging.INFO)

# Dosyaya loglama
file_handler = logging.FileHandler(log_dir / "app.log", encoding="utf-8")
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_formatter)

# Konsola loglama
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(levelname)s: %(message)s')
console_handler.setFormatter(console_formatter)

# Handler'ları ekle
logger.addHandler(file_handler)
logger.addHandler(console_handler) 