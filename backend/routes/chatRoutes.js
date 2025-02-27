const express = require('express');
const router = express.Router();
const {
  startChat,
  sendMessage,
  getChats,
  getChat,
  deleteChat,
  updateChatProvider,
  shareChat,
  getSharedChat,
} = require('../controllers/chatController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Sohbet başlatma ve listeleme
router.route('/')
  .post(optionalProtect, startChat)
  .get(optionalProtect, getChats);

// Paylaşılan sohbeti getir
router.get('/shared/:token', getSharedChat);

// Belirli bir sohbeti getir, mesaj gönder veya sil
router.route('/:id')
  .get(optionalProtect, getChat)
  .post(optionalProtect, sendMessage)
  .delete(optionalProtect, deleteChat);

// Sohbet AI sağlayıcısını güncelle
router.put('/:id/provider', optionalProtect, updateChatProvider);

// Sohbeti paylaş
router.post('/:id/share', protect, shareChat);

module.exports = router; 