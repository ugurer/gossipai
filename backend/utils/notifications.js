const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

/**
 * Kullanıcıya bildirim gönderir
 * @param {string} userId - Kullanıcı ID
 * @param {string} title - Bildirim başlığı
 * @param {string} message - Bildirim mesajı
 * @param {string} type - Bildirim tipi (chat, system, reminder, promo)
 * @param {string} actionUrl - Bildirime tıklandığında yönlendirilecek URL
 * @param {Date} expiresAt - Bildirimin sona erme tarihi
 * @returns {Promise<Object>} - Oluşturulan bildirim
 */
const sendNotification = async (userId, title, message, type = 'system', actionUrl = '', expiresAt = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      actionUrl,
      expiresAt
    });
    
    // Gerçek zamanlı bildirim için Socket.io kullanılabilir
    // Bu kısım ileride eklenecek
    
    return notification;
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının bildirimlerini getirir
 * @param {string} userId - Kullanıcı ID
 * @param {boolean} onlyUnread - Sadece okunmamış bildirimleri getir
 * @param {number} limit - Maksimum bildirim sayısı
 * @returns {Promise<Array>} - Bildirimler dizisi
 */
const getUserNotifications = async (userId, onlyUnread = false, limit = 20) => {
  try {
    const query = { user: userId };
    
    if (onlyUnread) {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
      
    return notifications;
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    throw error;
  }
};

/**
 * Bildirimi okundu olarak işaretle
 * @param {string} notificationId - Bildirim ID
 * @returns {Promise<Object>} - Güncellenen bildirim
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının tüm bildirimlerini okundu olarak işaretle
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<Object>} - Güncelleme sonucu
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    
    return result;
  } catch (error) {
    console.error('Toplu bildirim güncelleme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının bildirimlerini sil
 * @param {string} userId - Kullanıcı ID
 * @param {string} notificationId - Bildirim ID (opsiyonel, belirtilmezse tüm bildirimler silinir)
 * @returns {Promise<Object>} - Silme sonucu
 */
const deleteNotifications = async (userId, notificationId = null) => {
  try {
    const query = { user: userId };
    
    if (notificationId) {
      query._id = notificationId;
    }
    
    const result = await Notification.deleteMany(query);
    
    return result;
  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotifications
}; 