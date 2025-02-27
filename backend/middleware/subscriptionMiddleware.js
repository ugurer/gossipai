const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Kullanıcının abonelik durumunu kontrol eder ve request nesnesine ekler
 */
const checkSubscription = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    // Misafir kullanıcılar için sınırlı erişim
    req.subscription = 'free';
    req.credits = 0;
    return next();
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(401);
    throw new Error('Kullanıcı bulunamadı');
  }
  
  // Aboneliği kontrol et
  if (user.subscription.type !== 'free' && user.subscription.endDate && user.subscription.endDate < new Date()) {
    // Abonelik süresi dolmuş, free'ye düşür
    user.subscription.type = 'free';
    await user.save();
  }
  
  // Kullanıcı bilgisini request'e ekle
  req.subscription = user.subscription.type;
  req.credits = user.credits;
  
  next();
});

/**
 * Premium özelliklere erişimi kontrol eder
 */
const requirePremium = asyncHandler(async (req, res, next) => {
  if (!req.subscription || req.subscription === 'free') {
    res.status(403);
    throw new Error('Bu özellik premium abonelik gerektirir');
  }
  
  next();
});

/**
 * Pro özelliklere erişimi kontrol eder
 */
const requirePro = asyncHandler(async (req, res, next) => {
  if (!req.subscription || req.subscription !== 'pro') {
    res.status(403);
    throw new Error('Bu özellik pro abonelik gerektirir');
  }
  
  next();
});

/**
 * Kredi kullanımını kontrol eder
 * @param {number} requiredCredits - Gerekli kredi miktarı
 */
const requireCredits = (requiredCredits = 1) => {
  return asyncHandler(async (req, res, next) => {
    // Premium ve Pro abonelikler için kredi kontrolü yapma
    if (req.subscription === 'premium' || req.subscription === 'pro') {
      return next();
    }
    
    // Misafir kullanıcılar için kredi kontrolü yapma
    if (!req.user) {
      return next();
    }
    
    // Kredi kontrolü
    if (req.credits < requiredCredits) {
      res.status(403);
      throw new Error(`Bu işlem için ${requiredCredits} kredi gerekiyor. Mevcut krediniz: ${req.credits}`);
    }
    
    // Krediyi düş
    const user = await User.findById(req.user.id);
    user.credits -= requiredCredits;
    await user.save();
    
    // Güncel kredi miktarını güncelle
    req.credits = user.credits;
    
    next();
  });
};

module.exports = {
  checkSubscription,
  requirePremium,
  requirePro,
  requireCredits
}; 