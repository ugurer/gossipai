const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');
const { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotifications 
} = require('../utils/notifications');

// @desc    Kullanıcının bildirimlerini getir
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const onlyUnread = req.query.unread === 'true';
  const limit = parseInt(req.query.limit) || 20;
  
  const notifications = await getUserNotifications(req.user.id, onlyUnread, limit);
  
  res.status(200).json(notifications);
});

// @desc    Bildirimi okundu olarak işaretle
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Bildirim bulunamadı');
  }
  
  // Kullanıcının kendi bildirimi mi kontrol et
  if (notification.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Bu bildirimi işaretleme yetkiniz yok');
  }
  
  const updatedNotification = await markNotificationAsRead(req.params.id);
  
  res.status(200).json(updatedNotification);
});

// @desc    Tüm bildirimleri okundu olarak işaretle
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsRead(req.user.id);
  
  res.status(200).json({
    message: 'Tüm bildirimler okundu olarak işaretlendi',
    count: result.modifiedCount
  });
});

// @desc    Bildirimi sil
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Bildirim bulunamadı');
  }
  
  // Kullanıcının kendi bildirimi mi kontrol et
  if (notification.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Bu bildirimi silme yetkiniz yok');
  }
  
  await deleteNotifications(req.user.id, req.params.id);
  
  res.status(200).json({ id: req.params.id });
});

// @desc    Tüm bildirimleri sil
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await deleteNotifications(req.user.id);
  
  res.status(200).json({
    message: 'Tüm bildirimler silindi',
    count: result.deletedCount
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
}; 