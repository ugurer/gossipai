const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Kullanıcı kaydı
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Lütfen tüm alanları doldurun');
  }

  // Kullanıcının var olup olmadığını kontrol et
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Bu e-posta adresi zaten kullanılıyor');
  }

  // Kullanıcıyı oluştur
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Giriş zamanını güncelle
    await user.updateLoginTime();
    
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      preferences: user.preferences,
      subscription: user.subscription,
      credits: user.credits,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı bilgileri');
  }
});

// @desc    Kullanıcı girişi
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // E-posta kontrolü
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Giriş zamanını güncelle
    await user.updateLoginTime();
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      preferences: user.preferences,
      subscription: user.subscription,
      credits: user.credits,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz e-posta veya şifre');
  }
});

// @desc    Kullanıcı bilgilerini getir
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // Aktivite zamanını güncelle
  await req.user.updateActivity();
  
  res.status(200).json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    language: req.user.language,
    preferences: req.user.preferences,
    subscription: req.user.subscription,
    credits: req.user.credits,
  });
});

// @desc    Kullanıcı tercihlerini güncelle
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (!preferences) {
    res.status(400);
    throw new Error('Tercihler gereklidir');
  }

  // Kullanıcıyı güncelle
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { preferences },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  res.status(200).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    language: user.language,
    preferences: user.preferences,
    subscription: user.subscription,
    credits: user.credits,
  });
});

// @desc    Kullanıcı dilini güncelle
// @route   PUT /api/users/language
// @access  Private
const updateLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body;

  if (!language) {
    res.status(400);
    throw new Error('Dil seçimi gereklidir');
  }

  // Kullanıcıyı güncelle
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { language },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  res.status(200).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    language: user.language,
    preferences: user.preferences,
    subscription: user.subscription,
    credits: user.credits,
  });
});

// @desc    Push token kaydet
// @route   POST /api/users/push-token
// @access  Private
const registerPushToken = asyncHandler(async (req, res) => {
  const { token, deviceType } = req.body;

  if (!token || !deviceType) {
    res.status(400);
    throw new Error('Token ve cihaz tipi gereklidir');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Aynı token varsa ekleme
  if (!user.pushTokens.some(t => t.token === token)) {
    user.pushTokens.push({ token, deviceType });
    await user.save();
  }

  res.status(200).json({ message: 'Push token kaydedildi' });
});

// @desc    Kredi satın al
// @route   POST /api/users/buy-credits
// @access  Private
const buyCredits = asyncHandler(async (req, res) => {
  const { amount, paymentId } = req.body;

  if (!amount || !paymentId) {
    res.status(400);
    throw new Error('Miktar ve ödeme ID gereklidir');
  }

  // Burada gerçek bir ödeme işlemi yapılabilir
  // Şimdilik sadece kredileri artırıyoruz

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  user.credits += parseInt(amount);
  await user.save();

  res.status(200).json({
    credits: user.credits,
    message: `${amount} kredi başarıyla eklendi`
  });
});

// @desc    Kullanıcı API anahtarını güncelle
// @route   PUT /api/users/api-key
// @access  Private
const updateApiKey = asyncHandler(async (req, res) => {
  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    res.status(400);
    throw new Error('Sağlayıcı ve API anahtarı gereklidir');
  }

  // Desteklenen sağlayıcıları kontrol et
  if (!['openai', 'anthropic'].includes(provider)) {
    res.status(400);
    throw new Error('Desteklenmeyen sağlayıcı');
  }

  // Kullanıcıyı bul
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Kullanıcının tercihlerini güncelle
  if (!user.preferences) {
    user.preferences = {};
  }

  if (!user.preferences.aiSettings) {
    user.preferences.aiSettings = {
      defaultProvider: 'gemini',
      providers: {}
    };
  }

  if (!user.preferences.aiSettings.providers) {
    user.preferences.aiSettings.providers = {};
  }

  if (!user.preferences.aiSettings.providers[provider]) {
    user.preferences.aiSettings.providers[provider] = {
      enabled: true,
      apiKey: apiKey
    };
  } else {
    user.preferences.aiSettings.providers[provider].enabled = true;
    user.preferences.aiSettings.providers[provider].apiKey = apiKey;
  }

  await user.save();

  res.status(200).json({
    message: `${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarı başarıyla güncellendi`,
    provider,
    enabled: true
  });
});

// @desc    Kullanıcı varsayılan AI sağlayıcısını güncelle
// @route   PUT /api/users/default-provider
// @access  Private
const updateDefaultProvider = asyncHandler(async (req, res) => {
  const { provider } = req.body;

  if (!provider) {
    res.status(400);
    throw new Error('Sağlayıcı gereklidir');
  }

  // Desteklenen sağlayıcıları kontrol et
  if (!['gemini', 'openai', 'anthropic'].includes(provider)) {
    res.status(400);
    throw new Error('Desteklenmeyen sağlayıcı');
  }

  // Kullanıcıyı bul
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Gemini dışındaki sağlayıcılar için API anahtarı kontrolü
  if (provider !== 'gemini') {
    const providerSettings = user.preferences?.aiSettings?.providers?.[provider];
    if (!providerSettings || !providerSettings.enabled || !providerSettings.apiKey) {
      res.status(400);
      throw new Error(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarı gereklidir`);
    }
  }

  // Kullanıcının tercihlerini güncelle
  if (!user.preferences) {
    user.preferences = {};
  }

  if (!user.preferences.aiSettings) {
    user.preferences.aiSettings = {
      providers: {}
    };
  }

  user.preferences.aiSettings.defaultProvider = provider;

  await user.save();

  res.status(200).json({
    message: `Varsayılan AI sağlayıcısı ${provider} olarak güncellendi`,
    defaultProvider: provider
  });
});

// JWT Token oluştur
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePreferences,
  updateLanguage,
  registerPushToken,
  buyCredits,
  updateApiKey,
  updateDefaultProvider,
}; 