const asyncHandler = require('express-async-handler');
const Character = require('../models/characterModel');

// @desc    Tüm karakterleri getir
// @route   GET /api/characters
// @access  Public
const getCharacters = asyncHandler(async (req, res) => {
  // Varsayılan olarak tüm public karakterleri getir
  const query = { isPublic: true };

  // Eğer kullanıcı giriş yapmışsa, kendi karakterlerini de getir
  if (req.user) {
    query.$or = [{ isPublic: true }, { user: req.user.id }];
  }

  const characters = await Character.find(query);
  res.status(200).json(characters);
});

// @desc    Kullanıcının karakterlerini getir
// @route   GET /api/characters/me
// @access  Private
const getMyCharacters = asyncHandler(async (req, res) => {
  const characters = await Character.find({ user: req.user.id });
  res.status(200).json(characters);
});

// @desc    Karakter oluştur
// @route   POST /api/characters
// @access  Private
const createCharacter = asyncHandler(async (req, res) => {
  const { name, description, systemPrompt, isPublic } = req.body;

  if (!name || !description || !systemPrompt) {
    res.status(400);
    throw new Error('Lütfen tüm gerekli alanları doldurun');
  }

  const character = await Character.create({
    name,
    description,
    systemPrompt,
    isPublic: isPublic || false,
    user: req.user.id,
  });

  res.status(201).json(character);
});

// @desc    Karakter güncelle
// @route   PUT /api/characters/:id
// @access  Private
const updateCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  // Kullanıcının kendi karakteri mi kontrol et
  if (character.user && character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Bu karakteri düzenleme yetkiniz yok');
  }

  const updatedCharacter = await Character.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedCharacter);
});

// @desc    Karakter sil
// @route   DELETE /api/characters/:id
// @access  Private
const deleteCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  // Kullanıcının kendi karakteri mi kontrol et
  if (character.user && character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Bu karakteri silme yetkiniz yok');
  }

  await character.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Karakter detayını getir
// @route   GET /api/characters/:id
// @access  Public
const getCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  // Eğer karakter public değilse ve kullanıcının kendi karakteri değilse erişimi engelle
  if (!character.isPublic && (!req.user || character.user.toString() !== req.user.id)) {
    res.status(401);
    throw new Error('Bu karaktere erişim yetkiniz yok');
  }

  res.status(200).json(character);
});

module.exports = {
  getCharacters,
  getMyCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacter,
}; 