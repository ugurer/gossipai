import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA desteğini etkinleştir
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Yeni içerik mevcut olduğunda kullanıcıya bildir
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
  onSuccess: (registration) => {
    console.log('Uygulama çevrimdışı kullanım için hazır.');
    // Burada çevrimdışı kullanıma hazır olduğunu bildiren bir bildirim gösterilebilir
  }
});

// Web vitals performans metriklerini ölç
reportWebVitals(console.log); 