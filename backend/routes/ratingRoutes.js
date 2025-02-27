const express = require('express');
const router = express.Router();
const {
  addRating,
  getUserRatings,
  getCharacterRatings,
  deleteRating
} = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addRating)
  .get(protect, getUserRatings);

router.route('/:id').delete(protect, deleteRating);

router.get('/character/:id', getCharacterRatings);

module.exports = router; 