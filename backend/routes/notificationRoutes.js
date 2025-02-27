const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

router.put('/read-all', markAllAsRead);

router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router; 