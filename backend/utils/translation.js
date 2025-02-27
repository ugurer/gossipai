const axios = require('axios');

// Temel çeviriler
const translations = {
  'welcome': {
    'tr': 'Hoş geldiniz',
    'en': 'Welcome',
    'de': 'Willkommen',
    'fr': 'Bienvenue',
    'es': 'Bienvenido'
  },
  'chat': {
    'tr': 'Sohbet',
    'en': 'Chat',
    'de': 'Chat',
    'fr': 'Discussion',
    'es': 'Chat'
  },
  'characters': {
    'tr': 'Karakterler',
    'en': 'Characters',
    'de': 'Charaktere',
    'fr': 'Personnages',
    'es': 'Personajes'
  },
  'login': {
    'tr': 'Giriş Yap',
    'en': 'Login',
    'de': 'Anmelden',
    'fr': 'Connexion',
    'es': 'Iniciar sesión'
  },
  'register': {
    'tr': 'Kayıt Ol',
    'en': 'Register',
    'de': 'Registrieren',
    'fr': 'S\'inscrire',
    'es': 'Registrarse'
  },
  'logout': {
    'tr': 'Çıkış Yap',
    'en': 'Logout',
    'de': 'Abmelden',
    'fr': 'Déconnexion',
    'es': 'Cerrar sesión'
  },
  'settings': {
    'tr': 'Ayarlar',
    'en': 'Settings',
    'de': 'Einstellungen',
    'fr': 'Paramètres',
    'es': 'Configuración'
  },
  'profile': {
    'tr': 'Profil',
    'en': 'Profile',
    'de': 'Profil',
    'fr': 'Profil',
    'es': 'Perfil'
  },
  'error': {
    'tr': 'Hata',
    'en': 'Error',
    'de': 'Fehler',
    'fr': 'Erreur',
    'es': 'Error'
  },
  'success': {
    'tr': 'Başarılı',
    'en': 'Success',
    'de': 'Erfolg',
    'fr': 'Succès',
    'es': 'Éxito'
  }
};

/**
 * Çeviri yap
 * @param {string} key - Çeviri anahtarı
 * @param {string} lang - Dil kodu (tr, en, de, fr, es)
 * @returns {string} - Çevrilen metin
 */
const translate = (key, lang = 'tr') => {
  return translations[key]?.[lang] || translations[key]?.['tr'] || key;
};

/**
 * Metni belirtilen dile çevir (Gemini API kullanarak)
 * @param {string} text - Çevrilecek metin
 * @param {string} targetLang - Hedef dil kodu
 * @param {string} sourceLang - Kaynak dil kodu (otomatik algılama için boş bırakılabilir)
 * @returns {Promise<string>} - Çevrilen metin
 */
const translateText = async (text, targetLang = 'tr', sourceLang = '') => {
  try {
    if (!text) return '';
    
    // Kısa metinleri çevirme, performans için
    if (text.length < 3) return text;
    
    // Gemini API'yi kullanarak çeviri yap
    const prompt = sourceLang 
      ? `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translated text without any explanations:\n\n${text}`
      : `Translate the following text to ${targetLang}. Only return the translated text without any explanations:\n\n${text}`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      }
    );
    
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Çeviri hatası:', error);
    return text; // Hata durumunda orijinal metni döndür
  }
};

/**
 * Metindeki dili algıla
 * @param {string} text - Dili algılanacak metin
 * @returns {Promise<string>} - Algılanan dil kodu
 */
const detectLanguage = async (text) => {
  try {
    if (!text || text.length < 5) return 'tr'; // Çok kısa metinler için varsayılan
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: `Detect the language of this text and respond with only the language code (tr, en, de, fr, es, etc): "${text.substring(0, 100)}"` 
          }] 
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        },
      }
    );
    
    const langCode = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
    
    // Desteklenen dilleri kontrol et
    const supportedLangs = ['tr', 'en', 'de', 'fr', 'es'];
    return supportedLangs.includes(langCode) ? langCode : 'tr';
  } catch (error) {
    console.error('Dil algılama hatası:', error);
    return 'tr'; // Hata durumunda varsayılan olarak Türkçe
  }
};

module.exports = {
  translate,
  translateText,
  detectLanguage
}; 