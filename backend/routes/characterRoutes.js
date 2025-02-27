const express = require('express');
const router = express.Router();
const {
  getCharacters,
  getMyCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacter,
} = require('../controllers/characterController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getCharacters).post(protect, createCharacter);
router.route('/me').get(protect, getMyCharacters);
router
  .route('/:id')
  .get(getCharacter)
  .put(protect, updateCharacter)
  .delete(protect, deleteCharacter);

module.exports = router; 