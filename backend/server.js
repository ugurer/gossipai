const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { checkSubscription } = require('./middleware/subscriptionMiddleware');
const seedCharacters = require('./utils/seedData');

// Route'ları içe aktar
const userRoutes = require('./routes/userRoutes');
const characterRoutes = require('./routes/characterRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// Ortam değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısı
connectDB().then(() => {
  // Veritabanı bağlantısı başarılı olduktan sonra seed işlemini çalıştır
  seedCharacters();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Abonelik kontrolü middleware'i
app.use(checkSubscription);

// Statik dosyalar için klasör
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Route'ları
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);

// Sağlık kontrolü endpoint'i
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API çalışıyor',
    version: '1.1.0',
    environment: process.env.NODE_ENV
  });
});

// Production ortamında frontend statik dosyalarını servis et
if (process.env.NODE_ENV === 'production') {
  // Docker ortamında frontend dosyaları backend konteynerinde olmadığı için
  // bu kısmı devre dışı bırakıyoruz ve sadece API çalıştığını belirten bir mesaj dönüyoruz
  app.get('/', (req, res) => res.send('API çalışıyor...'));
  
  // Tanımlanmamış route'lar için 404 hatası döndür
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ message: 'API endpoint bulunamadı' });
    } else {
      res.status(404).send('Sayfa bulunamadı');
    }
  });
} else {
  app.get('/', (req, res) => res.send('API çalışıyor...'));
}

// Hata işleyici middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
}); 