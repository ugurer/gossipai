# GossipAI - Modern Yapay Zeka Sohbet Uygulaması

GossipAI, Google Gemini API kullanarak geliştirilmiş, modern ve kullanıcı dostu bir sohbet robotu uygulamasıdır. Farklı karakterlerle sohbet edebilir, kendi karakterlerinizi oluşturabilir ve yapay zeka teknolojisinin gücünü deneyimleyebilirsiniz.

![GossipAI Screenshot](./screenshots/gossipai-screenshot.png)

## 🚀 Özellikler

- **Modern Arayüz**: Minimalist ama etkileyici, göz yormayan canlı tasarım
- **Karakter Çeşitliliği**: Farklı kişiliklere sahip sohbet asistanları
- **Kişiselleştirme**: Kendi karakterlerinizi oluşturma ve özelleştirme
- **Kullanıcı Yönetimi**: Kayıt, giriş, JWT kimlik doğrulama
- **Misafir Kullanıcı Desteği**: Kayıt olmadan da kullanabilme
- **Dinamik Tema**: Açık ve koyu mod desteği
- **Responsive Tasarım**: Tüm cihazlarda sorunsuz çalışma
- **PWA Desteği**: Mobil cihazlara kurulabilme
- **Docker Desteği**: Kolay kurulum ve dağıtım

## 🎨 Tasarım Özellikleri

- **Renk Paleti**:
  - Ana Renk: Canlı Mavi (#3A86FF)
  - Yardımcı Renkler: Turuncu (#FF7F11), Mor (#845EC2), Yeşil (#2ECC71)
  - Arka Plan: Açık mod (#F9F9F9), Koyu mod (#1B1B3A)

- **Animasyonlar ve Geçişler**:
  - Hover efektleri
  - Yumuşak geçişler
  - Etkileşimli UI elementleri

- **Neumorphism Tasarım**:
  - Hafif gölgeler
  - Yumuşak geçişler
  - Yuvarlatılmış köşeler

## 🛠️ Kurulum

### Docker ile Kurulum

1. Projeyi klonlayın:
   ```
   git clone https://github.com/ugurer/gossipai.git
   cd gossipai
   ```

2. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:
   ```
   cp .env.example .env
   ```

3. `.env` dosyasını düzenleyin ve `GEMINI_API_KEY` değerini gerçek API anahtarınızla değiştirin.

4. Docker Compose ile uygulamayı başlatın:
   ```
   docker-compose up -d
   ```

5. Tarayıcınızda `http://localhost` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

### Manuel Kurulum

#### Backend

1. Backend klasörüne gidin:
   ```
   cd backend
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gossipai
   JWT_SECRET=your_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Sunucuyu başlatın:
   ```
   npm start
   ```

#### Frontend

1. Frontend klasörüne gidin:
   ```
   cd frontend
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```
   npm start
   ```

4. Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

## 🧠 Kullanılan Teknolojiler

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Kimlik Doğrulama
- Google Gemini API

### Frontend
- React
- Material UI
- React Router
- Axios
- PWA

## 📱 Ekran Görüntüleri

![Ana Sayfa](./screenshots/home.png)
![Karakter Seçimi](./screenshots/characters.png)
![Sohbet Ekranı](./screenshots/chat.png)

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Sorularınız veya önerileriniz için [issues](https://github.com/ugurer/gossipai/issues) bölümünü kullanabilirsiniz. 