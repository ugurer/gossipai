import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Hem named export hem de default export olarak tanımlıyoruz
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestId, setGuestId] = useState(localStorage.getItem('guestId'));
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'tr');
  const [credits, setCredits] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Sayfa yüklendiğinde token varsa kullanıcı bilgilerini getir
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          const res = await axios.get('/api/users/me', config);
          setUser(res.data);
          setCredits(res.data.credits || 0);
          
          // Kullanıcı dil tercihini ayarla
          if (res.data.language) {
            setLanguage(res.data.language);
            localStorage.setItem('language', res.data.language);
          }
          
          // Bildirimleri yükle
          fetchNotifications();
        } catch (err) {
          console.error('Kullanıcı bilgileri alınamadı:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }

      // Misafir ID yoksa oluştur
      if (!guestId) {
        const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('guestId', newGuestId);
        setGuestId(newGuestId);
      }

      setLoading(false);
    };

    loadUser();
  }, [token, guestId]);

  // Bildirimleri getir
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const res = await axios.get('/api/notifications', config);
      setNotifications(res.data);
      
      // Okunmamış bildirimleri say
      const unread = res.data.filter(notification => !notification.isRead).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Bildirimler alınamadı:', err);
    }
  };

  // Kayıt ol
  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/users', { name, email, password });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      setCredits(res.data.credits || 0);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
      return false;
    }
  };

  // Giriş yap
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/users/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      setCredits(res.data.credits || 0);
      
      // Kullanıcı dil tercihini ayarla
      if (res.data.language) {
        setLanguage(res.data.language);
        localStorage.setItem('language', res.data.language);
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş sırasında bir hata oluştu');
      return false;
    }
  };

  // Çıkış yap
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadNotifications(0);
  };

  // Dil değiştir
  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        
        await axios.put('/api/users/language', { language: newLanguage }, config);
      }
      
      return true;
    } catch (err) {
      console.error('Dil değiştirme hatası:', err);
      return false;
    }
  };

  // Kullanıcı tercihlerini güncelle
  const updatePreferences = async (preferences) => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const res = await axios.put('/api/users/preferences', { preferences }, config);
      setUser({ ...user, preferences: res.data.preferences });
      
      return true;
    } catch (err) {
      console.error('Tercih güncelleme hatası:', err);
      return false;
    }
  };

  // Kredi satın al
  const buyCredits = async (amount, paymentId) => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const res = await axios.post('/api/users/buy-credits', { amount, paymentId }, config);
      setCredits(res.data.credits);
      
      return true;
    } catch (err) {
      console.error('Kredi satın alma hatası:', err);
      return false;
    }
  };

  // Push token kaydet
  const registerPushToken = async (token, deviceType) => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.post('/api/users/push-token', { token, deviceType }, config);
      
      return true;
    } catch (err) {
      console.error('Push token kaydetme hatası:', err);
      return false;
    }
  };

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = async (notificationId) => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.put(`/api/notifications/${notificationId}`, {}, config);
      
      // Bildirimleri güncelle
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Okunmamış bildirimleri güncelle
      setUnreadNotifications(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Bildirim işaretleme hatası:', err);
      return false;
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllNotificationsAsRead = async () => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.put('/api/notifications/read-all', {}, config);
      
      // Bildirimleri güncelle
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadNotifications(0);
      
      return true;
    } catch (err) {
      console.error('Bildirim işaretleme hatası:', err);
      return false;
    }
  };

  // Bildirimi sil
  const deleteNotification = async (notificationId) => {
    try {
      if (!token) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.delete(`/api/notifications/${notificationId}`, config);
      
      // Bildirimleri güncelle
      const updatedNotifications = notifications.filter(
        notification => notification._id !== notificationId
      );
      setNotifications(updatedNotifications);
      
      // Okunmamış bildirimleri güncelle
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Bildirim silme hatası:', err);
      return false;
    }
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  // API anahtarını güncelle
  const updateApiKey = async (provider, apiKey) => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        '/api/users/api-key',
        { provider, apiKey },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = { ...user };
      
      if (!updatedUser.preferences) {
        updatedUser.preferences = {};
      }
      
      if (!updatedUser.preferences.aiSettings) {
        updatedUser.preferences.aiSettings = {
          defaultProvider: 'gemini',
          providers: {}
        };
      }
      
      if (!updatedUser.preferences.aiSettings.providers) {
        updatedUser.preferences.aiSettings.providers = {};
      }
      
      if (!updatedUser.preferences.aiSettings.providers[provider]) {
        updatedUser.preferences.aiSettings.providers[provider] = {
          enabled: true,
          apiKey: apiKey
        };
      } else {
        updatedUser.preferences.aiSettings.providers[provider].enabled = true;
        updatedUser.preferences.aiSettings.providers[provider].apiKey = apiKey;
      }
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'API anahtarı güncellenirken bir hata oluştu');
      throw error;
    }
  };

  // Varsayılan AI sağlayıcısını güncelle
  const updateDefaultProvider = async (provider) => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        '/api/users/default-provider',
        { provider },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = { ...user };
      
      if (!updatedUser.preferences) {
        updatedUser.preferences = {};
      }
      
      if (!updatedUser.preferences.aiSettings) {
        updatedUser.preferences.aiSettings = {
          providers: {}
        };
      }
      
      updatedUser.preferences.aiSettings.defaultProvider = provider;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Varsayılan AI sağlayıcısı güncellenirken bir hata oluştu');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        guestId,
        loading,
        error,
        language,
        credits,
        notifications,
        unreadNotifications,
        register,
        login,
        logout,
        clearError,
        changeLanguage,
        updatePreferences,
        buyCredits,
        registerPushToken,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        updateApiKey,
        updateDefaultProvider,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 