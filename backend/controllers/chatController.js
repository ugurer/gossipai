const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const Character = require('../models/characterModel');
const User = require('../models/userModel');
const { updateUserContext } = require('../utils/contextManager');
const { logInteraction } = require('../utils/analytics');
const AIService = require('../utils/aiService');

// @desc    Yeni sohbet başlat
// @route   POST /api/chat
// @access  Public
const startChat = asyncHandler(async (req, res) => {
  const { characterId, message, guestId, aiProvider, aiModel } = req.body;

  if (!characterId || !message) {
    res.status(400);
    throw new Error('Karakter ID ve mesaj gereklidir');
  }

  // Karakteri bul
  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404);
    throw new Error('Karakter bulunamadı');
  }

  // Eğer karakter public değilse ve kullanıcının kendi karakteri değilse erişimi engelle
  if (!character.isPublic && (!req.user || character.user.toString() !== req.user.id)) {
    res.status(401);
    throw new Error('Bu karaktere erişim yetkiniz yok');
  }

  // AI sağlayıcı ve model bilgilerini belirle
  let selectedAiProvider = aiProvider || 'gemini';
  let selectedAiModel = aiModel || 'gemini-2.0-flash';
  let aiSettings = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxTokens: 1000
  };

  // Kullanıcı giriş yapmışsa, tercihlerini kontrol et
  if (req.user) {
    const user = await User.findById(req.user.id);
    if (!aiProvider) {
      // Kullanıcı tercihlerinden varsayılan sağlayıcıyı al
      selectedAiProvider = user.preferences?.aiSettings?.defaultProvider || 'gemini';
    }
    
    // Seçilen sağlayıcı için model ve ayarları al
    const providerSettings = user.preferences?.aiSettings?.providers?.[selectedAiProvider];
    if (providerSettings) {
      if (!aiModel && providerSettings.model) {
        selectedAiModel = providerSettings.model;
      }
      
      if (providerSettings.temperature) {
        aiSettings.temperature = providerSettings.temperature;
      }
    }
  }

  // Sistem mesajını oluştur
  const systemMessage = {
    role: 'system',
    content: character.systemPrompt,
  };

  // Kullanıcı mesajını oluştur
  const userMessage = {
    role: 'user',
    content: message,
    createdAt: new Date()
  };

  // Yeni sohbet oluştur
  const chat = await Chat.create({
    title: `${character.name} ile Sohbet`,
    messages: [systemMessage, userMessage],
    character: character._id,
    user: req.user ? req.user.id : null,
    guestId: !req.user ? guestId : null,
    aiProvider: selectedAiProvider,
    aiModel: selectedAiModel,
    aiSettings
  });

  // AI yanıtı al
  const aiResponse = await getAIResponse(chat.messages, selectedAiProvider, selectedAiModel, aiSettings);

  // AI yanıtını sohbete ekle
  chat.messages.push({
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date()
  });

  await chat.save();

  // Etkileşimi kaydet
  logInteraction(
    req.user ? req.user.id : null,
    !req.user ? guestId : null,
    characterId,
    'chat_start',
    { messageCount: 2 }
  );

  // Karakter popülerliğini güncelle
  await Character.findByIdAndUpdate(
    characterId,
    { 
      $inc: { 
        'popularity.chatCount': 1,
        'popularity.messageCount': 2
      } 
    }
  );

  res.status(201).json({
    chatId: chat._id,
    message: userMessage,
    reply: {
      role: 'assistant',
      content: aiResponse,
      createdAt: new Date()
    },
  });
});

// @desc    Sohbete mesaj gönder
// @route   POST /api/chat/:id
// @access  Public
const sendMessage = asyncHandler(async (req, res) => {
  const { message, aiProvider, aiModel } = req.body;
  const chatId = req.params.id;

  if (!message) {
    res.status(400);
    throw new Error('Mesaj gereklidir');
  }

  // Sohbeti bul
  const chat = await Chat.findById(chatId).populate('character');
  if (!chat) {
    res.status(404);
    throw new Error('Sohbet bulunamadı');
  }

  // Kullanıcının erişim yetkisi var mı kontrol et
  if (
    (chat.user && (!req.user || chat.user.toString() !== req.user.id)) ||
    (!chat.user && !chat.guestId)
  ) {
    res.status(401);
    throw new Error('Bu sohbete erişim yetkiniz yok');
  }

  // AI sağlayıcı ve model bilgilerini güncelle (isteğe bağlı)
  if (aiProvider) {
    chat.aiProvider = aiProvider;
  }
  
  if (aiModel) {
    chat.aiModel = aiModel;
  }

  // Kullanıcı mesajını oluştur
  const userMessage = {
    role: 'user',
    content: message,
    createdAt: new Date()
  };

  // Kullanıcı mesajını sohbete ekle
  chat.messages.push(userMessage);

  // AI yanıtı al
  const aiResponse = await getAIResponse(
    chat.messages, 
    chat.aiProvider, 
    chat.aiModel, 
    chat.aiSettings
  );

  // AI yanıtını sohbete ekle
  const assistantMessage = {
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date()
  };
  
  chat.messages.push(assistantMessage);

  await chat.save();

  // Etkileşimi kaydet
  logInteraction(
    req.user ? req.user.id : null,
    !req.user ? chat.guestId : null,
    chat.character._id,
    'message_sent',
    { messageId: chat.messages.length - 2 }
  );

  // Karakter popülerliğini güncelle
  await Character.findByIdAndUpdate(
    chat.character._id,
    { $inc: { 'popularity.messageCount': 2 } }
  );

  // Kullanıcı-karakter ilişkisini güncelle
  if (req.user) {
    updateUserContext(req.user.id, chat.character._id, chat.messages)
      .catch(err => console.error('Kullanıcı bağlamı güncelleme hatası:', err));
  }

  res.status(200).json({
    chatId: chat._id,
    message: userMessage,
    reply: assistantMessage
  });
});

// @desc    Kullanıcının sohbetlerini getir
// @route   GET /api/chat
// @access  Private/Public
const getChats = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user) {
    // Giriş yapmış kullanıcı için
    query.user = req.user.id;
  } else if (req.query.guestId) {
    // Misafir kullanıcı için
    query.guestId = req.query.guestId;
  } else {
    res.status(400);
    throw new Error('Kullanıcı kimliği veya misafir kimliği gereklidir');
  }

  const chats = await Chat.find(query)
    .populate('character', 'name description')
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});

// @desc    Sohbet detayını getir
// @route   GET /api/chat/:id
// @access  Private/Public
const getChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate(
    'character',
    'name description'
  );

  if (!chat) {
    res.status(404);
    throw new Error('Sohbet bulunamadı');
  }

  // Kullanıcının erişim yetkisi var mı kontrol et
  if (
    (chat.user && (!req.user || chat.user.toString() !== req.user.id)) ||
    (!chat.user && req.query.guestId !== chat.guestId)
  ) {
    res.status(401);
    throw new Error('Bu sohbete erişim yetkiniz yok');
  }

  res.status(200).json(chat);
});

// @desc    Sohbeti sil
// @route   DELETE /api/chat/:id
// @access  Private/Public
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Sohbet bulunamadı');
  }

  // Kullanıcının erişim yetkisi var mı kontrol et
  if (
    (chat.user && (!req.user || chat.user.toString() !== req.user.id)) ||
    (!chat.user && req.query.guestId !== chat.guestId)
  ) {
    res.status(401);
    throw new Error('Bu sohbeti silme yetkiniz yok');
  }

  await chat.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Sohbet AI sağlayıcısını güncelle
// @route   PUT /api/chat/:id/provider
// @access  Private/Public
const updateChatProvider = asyncHandler(async (req, res) => {
  const { aiProvider, aiModel, aiSettings } = req.body;
  const chatId = req.params.id;

  if (!aiProvider) {
    res.status(400);
    throw new Error('AI sağlayıcı gereklidir');
  }

  // Sohbeti bul
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Sohbet bulunamadı');
  }

  // Kullanıcının erişim yetkisi var mı kontrol et
  if (
    (chat.user && (!req.user || chat.user.toString() !== req.user.id)) ||
    (!chat.user && req.query.guestId !== chat.guestId)
  ) {
    res.status(401);
    throw new Error('Bu sohbeti güncelleme yetkiniz yok');
  }

  // AI sağlayıcı ve model bilgilerini güncelle
  chat.aiProvider = aiProvider;
  
  if (aiModel) {
    chat.aiModel = aiModel;
  }
  
  if (aiSettings) {
    chat.aiSettings = {
      ...chat.aiSettings,
      ...aiSettings
    };
  }

  await chat.save();

  res.status(200).json({
    chatId: chat._id,
    aiProvider: chat.aiProvider,
    aiModel: chat.aiModel,
    aiSettings: chat.aiSettings
  });
});

// @desc    Sohbeti paylaş
// @route   POST /api/chat/:id/share
// @access  Private
const shareChat = asyncHandler(async (req, res) => {
  const chatId = req.params.id;

  // Sohbeti bul
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Sohbet bulunamadı');
  }

  // Kullanıcının erişim yetkisi var mı kontrol et
  if (!req.user || (chat.user && chat.user.toString() !== req.user.id)) {
    res.status(401);
    throw new Error('Bu sohbeti paylaşma yetkiniz yok');
  }

  // Paylaşım token'ı oluştur
  const shareToken = `share_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Sohbeti güncelle
  chat.shareToken = shareToken;
  chat.isShared = true;
  
  await chat.save();

  res.status(200).json({
    chatId: chat._id,
    shareToken,
    shareUrl: `/shared/${shareToken}`
  });
});

// @desc    Paylaşılan sohbeti getir
// @route   GET /api/chat/shared/:token
// @access  Public
const getSharedChat = asyncHandler(async (req, res) => {
  const shareToken = req.params.token;

  // Sohbeti bul
  const chat = await Chat.findOne({ shareToken }).populate(
    'character',
    'name description'
  );

  if (!chat || !chat.isShared) {
    res.status(404);
    throw new Error('Paylaşılan sohbet bulunamadı');
  }

  res.status(200).json(chat);
});

// AI API'den yanıt al
const getAIResponse = async (messages, aiProvider = 'gemini', aiModel = null, aiSettings = {}) => {
  try {
    // AI servisini oluştur
    const aiService = new AIService(aiProvider);
    
    // Mesaj sayısı çok fazlaysa, context yönetimi yap
    const MAX_MESSAGES = 10; // Maksimum mesaj sayısı
    let contextSummary = '';

    if (messages.length > MAX_MESSAGES) {
      // Eski mesajları özetle
      const oldMessages = messages.slice(0, messages.length - MAX_MESSAGES);
      
      // Sistem mesajını bul
      const systemMessage = messages.find(msg => msg.role === 'system');
      const systemPrompt = systemMessage ? systemMessage.content : '';
      
      // Eski mesajların özeti için bir istek gönder
      try {
        contextSummary = await aiService.generateSummary(oldMessages, systemPrompt);
      } catch (error) {
        console.error('Özet oluşturma hatası:', error);
        // Hata durumunda özet oluşturamadık, son mesajlarla devam et
      }
    }
    
    // Özet varsa, mesajlara ekle
    if (contextSummary) {
      // Sistem mesajını bul ve koru
      const systemMessage = messages.find(msg => msg.role === 'system');
      
      // Son mesajları al
      const recentMessages = messages.slice(messages.length - MAX_MESSAGES);
      
      // Yeni mesaj dizisi oluştur
      const newMessages = [];
      
      // Sistem mesajını ekle
      if (systemMessage) {
        newMessages.push(systemMessage);
      }
      
      // Özet mesajını ekle
      newMessages.push({
        role: 'system',
        content: `Önceki konuşma özeti: ${contextSummary}`
      });
      
      // Son mesajları ekle
      newMessages.push(...recentMessages);
      
      // Mesajları güncelle
      messages = newMessages;
    }

    // AI yanıtı al
    const options = {
      model: aiModel,
      ...aiSettings
    };
    
    return await aiService.generateResponse(messages, options);
  } catch (error) {
    console.error('AI API Hatası:', error.message);
    return 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.';
  }
};

module.exports = {
  startChat,
  sendMessage,
  getChats,
  getChat,
  deleteChat,
  updateChatProvider,
  shareChat,
  getSharedChat,
}; 