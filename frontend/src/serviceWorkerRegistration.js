// Bu isteğe bağlı kod, uygulamanızı bir service worker olarak kaydetmek için kullanılır.
// register() çağrılmadığı sürece hiçbir şey yapmaz.

// Bu, uygulamanızın daha hızlı yüklenmesine ve çevrimdışı deneyim sunmasına olanak tanır.
// Ancak, geliştirme sırasında, kullanıcılar eski önbelleğe alınmış sayfaları görebilir,
// bu nedenle geliştirici ve kullanıcı, sayfayı yenilemek için manuel olarak yenileme yapmalıdır.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] localhost için IPv6 adresidir.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8, localhost için IPv4 adresleridir.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // URL constructor, tüm tarayıcılarda desteklenmez, bu nedenle window.location.origin kullanıyoruz
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URL farklı bir origin'e sahipse, service worker çalışmayacaktır.
      // Bu muhtemelen bir CDN kullanıldığında olur.
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Bu localhost'ta çalışıyor. Service worker'ın hala var olup olmadığını kontrol edelim.
        checkValidServiceWorker(swUrl, config);

        // Localhost'ta, bazı ek günlük bilgileri gösterelim.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Bu web uygulaması ilk önce bir service worker tarafından önbelleğe alınıyor ve ' +
              'daha sonra çevrimdışı olarak sunuluyor.'
          );
        });
      } else {
        // Localhost değil. Sadece service worker'ı kaydedelim
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Bu noktada, eski içerik temizlenmiş ve yeni içerik indirilmiştir.
              console.log(
                'Yeni içerik kullanılabilir; Lütfen sayfayı yenileyin.'
              );

              // Callback'i çağıralım
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Bu noktada, her şey önbelleğe alınmıştır.
              console.log('İçerik çevrimdışı kullanım için önbelleğe alındı.');

              // Callback'i çağıralım
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service worker kaydı sırasında hata:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Service worker'ın bulunup bulunamadığını kontrol edin.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Service worker var, ancak JS dosyası olarak ayrıştırılamıyor.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker bulunamadı. Muhtemelen farklı bir uygulama. Sayfayı yenileyin.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker bulundu. Normal şekilde devam edin.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('İnternet bağlantısı yok. Uygulama çevrimdışı modda çalışıyor.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 