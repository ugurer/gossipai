# Katkıda Bulunma Rehberi

GossipAI projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## Geliştirme Ortamı Kurulumu

1. Projeyi fork edin ve klonlayın:
   ```
   git clone https://github.com/ugurer/gossipai.git
   cd gossipai
   ```

2. Bağımlılıkları yükleyin:
   ```
   # Backend için
   cd backend
   npm install

   # Frontend için
   cd ../frontend
   npm install
   ```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:
   ```
   cp .env.example .env
   ```

4. Geliştirme sunucularını başlatın:
   ```
   # Backend için
   cd backend
   npm run dev

   # Frontend için
   cd ../frontend
   npm start
   ```

## Kod Standartları

- JavaScript için ESLint kurallarına uyun
- React bileşenleri için fonksiyonel bileşenler ve hooks kullanın
- Anlaşılır ve açıklayıcı değişken/fonksiyon isimleri kullanın
- Kodunuzu yorum satırlarıyla açıklayın
- Tüm API isteklerini try-catch blokları içinde yapın

## Commit Mesajları

Commit mesajlarınızı aşağıdaki formatta yazın:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Örnek:
```
feat(auth): add password reset functionality

- Add password reset API endpoint
- Create password reset email template
- Add password reset form component
```

Tip türleri:
- `feat`: Yeni bir özellik
- `fix`: Hata düzeltmesi
- `docs`: Sadece dokümantasyon değişiklikleri
- `style`: Kod davranışını etkilemeyen değişiklikler (boşluk, biçimlendirme, vb.)
- `refactor`: Hata düzeltmesi veya özellik eklemeyen kod değişiklikleri
- `perf`: Performansı artıran değişiklikler
- `test`: Test ekleme veya düzeltme
- `chore`: Yapı süreçleri veya yardımcı araçlardaki değişiklikler

## Pull Request Süreci

1. Yeni bir branch oluşturun:
   ```
   git checkout -b feature/amazing-feature
   ```

2. Değişikliklerinizi yapın ve commit edin:
   ```
   git commit -m "feat: add amazing feature"
   ```

3. Branch'inizi push edin:
   ```
   git push origin feature/amazing-feature
   ```

4. GitHub'da bir Pull Request açın.

5. Pull Request'iniz gözden geçirilecek ve gerekirse değişiklikler istenecektir.

6. Tüm gözden geçirmeler tamamlandıktan sonra, PR birleştirilecektir.

## Hata Raporlama

Bir hata bulduğunuzda, lütfen GitHub Issues bölümünde yeni bir issue açın ve aşağıdaki bilgileri içerdiğinden emin olun:

- Hatanın açık ve net bir açıklaması
- Hatayı yeniden oluşturmak için adımlar
- Beklenen davranış ve gerçekleşen davranış
- Ekran görüntüleri (mümkünse)
- Ortam bilgileri (işletim sistemi, tarayıcı, vb.)

## Özellik İstekleri

Yeni bir özellik önermek için, GitHub Issues bölümünde yeni bir issue açın ve özelliğinizi detaylı bir şekilde açıklayın. Özelliğin neden faydalı olacağını ve nasıl uygulanabileceğini belirtmeyi unutmayın.

## Lisans

Bu projeye katkıda bulunarak, katkılarınızın projenin lisansı (MIT) altında lisanslanacağını kabul etmiş olursunuz. 