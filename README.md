# 🤖 Hukuki AI Danışman Sistemi

Yapay zeka destekli hukuki doküman analizi ve danışmanlık sistemi.

## 🚀 Özellikler

- 📄 PDF Doküman İşleme ve Analiz
- 🔍 Semantik Arama
- 💡 AI Destekli Soru-Cevap
- 🎯 Vektör Tabanlı Benzerlik Analizi
- 🔄 Otomatik Yedekleme Sistemi

## 🛠️ Teknolojik Altyapı

### Backend
- FastAPI
- Sentence Transformers
- FAISS Vector DB
- Google Gemini Pro
- PyPDF2

### Frontend
- React
- TypeScript
- Material-UI
- Axios

## 📋 Gereksinimler

### Backend
- Python 3.9+
- pip
- virtualenv

### Frontend
- Node.js 16+
- npm/yarn

### API Anahtarları
- Google Cloud API Anahtarı

## 🔧 Kurulum

1. Repository'yi klonlayın:
```bash
git clone <repo-url>
cd hukuki-ai
```

2. Backend kurulumu:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend kurulumu:
```bash
cd frontend
npm install
```

4. Ortam değişkenlerini ayarlayın:
- `backend/.env` dosyasını oluşturun:
```env
GOOGLE_API_KEY=your_api_key
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
VECTOR_DB_PATH=./data/vector_db/vectors
UPLOAD_DIR=./data/uploads
```

- `frontend/.env` dosyasını oluşturun:
```env
REACT_APP_API_URL=http://localhost:8001
REACT_APP_MAX_UPLOAD_SIZE=10485760
```

## 🚀 Çalıştırma

1. Backend'i başlatın:
```bash
cd backend
PYTHONPATH=. uvicorn api.main:app --host 0.0.0.0 --port 8001
```

2. Frontend'i başlatın:
```bash
cd frontend
npm start
```

## 📁 Dizin Yapısı

```
hukuki-ai/
├── backend/
│   ├── api/           # FastAPI endpoint'leri
│   ├── core/          # Temel işlevler
│   └── tests/         # Testler
├── frontend/
│   ├── public/        # Statik dosyalar
│   └── src/           # React kaynak kodları
└── docs/             # Dokümantasyon
```

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork'layın
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 