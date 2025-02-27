const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Koruma middleware'ini opsiyonel olarak kullan
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.log('Opsiyonel koruma hatası:', error);
      // Token geçersiz, ama devam et
    }
  }

  // Token olsun olmasın devam et
  next();
});

// Abonelik kontrolü
const requireSubscription = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Bu işlem için giriş yapmanız gerekiyor');
  }

  // Kullanıcının abonelik durumunu kontrol et
  if (req.user.subscription.type === 'free') {
    res.status(403);
    throw new Error('Bu özellik için premium abonelik gerekiyor');
  }

  next();
});

// Premium abonelik kontrolü
const requirePremium = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Bu işlem için giriş yapmanız gerekiyor');
  }

  // Kullanıcının premium abonelik durumunu kontrol et
  if (req.user.subscription.type !== 'premium' && req.user.subscription.type !== 'pro') {
    res.status(403);
    throw new Error('Bu özellik için premium abonelik gerekiyor');
  }

  next();
});

// Pro abonelik kontrolü
const requirePro = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Bu işlem için giriş yapmanız gerekiyor');
  }

  // Kullanıcının pro abonelik durumunu kontrol et
  if (req.user.subscription.type !== 'pro') {
    res.status(403);
    throw new Error('Bu özellik için pro abonelik gerekiyor');
  }

  next();
});

// Kredi kontrolü
const checkCredits = (requiredCredits) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Bu işlem için giriş yapmanız gerekiyor');
    }

    // Kullanıcının kredilerini kontrol et
    if (req.user.credits < requiredCredits) {
      res.status(403);
      throw new Error(`Bu işlem için ${requiredCredits} kredi gerekiyor. Mevcut krediniz: ${req.user.credits}`);
    }

    // Kredi kullanımını req nesnesine ekle
    req.creditsToUse = requiredCredits;

    next();
  });
};

module.exports = { 
  protect, 
  optionalProtect,
  requireSubscription,
  requirePremium,
  requirePro,
  checkCredits
}; 