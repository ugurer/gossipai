const asyncHandler = require('express-async-handler');
const Rating = require('../models/ratingModel');
const Character = require('../models/characterModel');

// @desc    Karakter derecelendirmesi ekle veya güncelle
// @route   POST /api/ratings
// @access  Private
const addRating = asyncHandler(async (req, res) => {
  const { characterId, rating, comment } = req.body;

  if (!characterId || !rating) {
    res.status(400);
    throw new Error('Karakter ID ve derecelendirme gereklidir');
  }

  // Derecelendirme değerini kontrol et
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Derecelendirme 1 ile 5 arasında olmalıdır');
  }

  // Karakterin var olup olmadığını kontrol et
  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  // Kullanıcının bu karakteri daha önce derecelendirip derecelendirmediğini kontrol et
  let userRating = await Rating.findOne({
    user: req.user.id,
    character: characterId
  });

  if (userRating) {
    // Mevcut derecelendirmeyi güncelle
    userRating.rating = rating;
    userRating.comment = comment || userRating.comment;
    await userRating.save();
  } else {
    // Yeni derecelendirme oluştur
    userRating = await Rating.create({
      user: req.user.id,
      character: characterId,
      rating,
      comment
    });
  }

  res.status(201).json(userRating);
});

// @desc    Kullanıcının derecelendirmelerini getir
// @route   GET /api/ratings
// @access  Private
const getUserRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ user: req.user.id })
    .populate('character', 'name description avatarUrl');

  res.status(200).json(ratings);
});

// @desc    Karakter derecelendirmelerini getir
// @route   GET /api/ratings/character/:id
// @access  Public
const getCharacterRatings = asyncHandler(async (req, res) => {
  const characterId = req.params.id;

  // Karakterin var olup olmadığını kontrol et
  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  const ratings = await Rating.find({ character: characterId })
    .populate('user', 'name');

  res.status(200).json(ratings);
});

// @desc    Derecelendirmeyi sil
// @route   DELETE /api/ratings/:id
// @access  Private
const deleteRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    res.status(404);
    throw new Error('Derecelendirme bulunamadı');
  }

  // Kullanıcının kendi derecelendirmesi mi kontrol et
  if (rating.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Bu derecelendirmeyi silme yetkiniz yok');
  }

  await rating.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  addRating,
  getUserRatings,
  getCharacterRatings,
  deleteRating
}; 