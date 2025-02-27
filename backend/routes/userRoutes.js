const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updatePreferences,
  updateLanguage,
  registerPushToken,
  buyCredits,
  updateApiKey,
  updateDefaultProvider,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/language', protect, updateLanguage);
router.post('/push-token', protect, registerPushToken);
router.post('/buy-credits', protect, buyCredits);
router.put('/api-key', protect, updateApiKey);
router.put('/default-provider', protect, updateDefaultProvider);

module.exports = router; 