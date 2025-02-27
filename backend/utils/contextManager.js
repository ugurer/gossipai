const axios = require('axios');
const UserCharacterRelation = require('../models/userCharacterRelationModel');

/**
 * Kullanıcı-karakter ilişkisini güncelle
 * @param {string} userId - Kullanıcı ID
 * @param {string} characterId - Karakter ID
 * @param {Array} messages - Sohbet mesajları
 * @returns {Promise<Object>} - Güncellenen ilişki
 */
const updateUserContext = async (userId, characterId, messages) => {
  try {
    if (!userId || !characterId) return null;
    
    // Mevcut ilişkiyi bul veya oluştur
    let relation = await UserCharacterRelation.findOne({ 
      user: userId, 
      character: characterId 
    });
    
    if (!relation) {
      relation = new UserCharacterRelation({ 
        user: userId, 
        character: characterId,
        interactionCount: 0
      });
    }
    
    // Etkileşim sayısını artır
    relation.interactionCount += 1;
    relation.lastInteractionAt = new Date();
    
    // Mesaj sayısı belirli bir eşiği geçtiyse context özeti oluştur
    if (messages.length > 20 && relation.interactionCount % 5 === 0) {
      try {
        const contextSummary = await generateUserContextSummary(messages, relation.userContext);
        relation.userContext = contextSummary;
      } catch (error) {
        console.error('Context özeti oluşturma hatası:', error);
        // Hata durumunda mevcut context'i koru
      }
    }
    
    // Konuşma konularını çıkar
    const topics = await extractTopics(messages);
    if (topics && topics.length > 0) {
      // Mevcut konularla birleştir ve tekrarları kaldır
      relation.topics = [...new Set([...relation.topics, ...topics])];
    }
    
    await relation.save();
    return relation;
  } catch (error) {
    console.error('Context güncelleme hatası:', error);
    return null;
  }
};

/**
 * Mesajlardan kullanıcı bağlamı özeti oluştur
 * @param {Array} messages - Sohbet mesajları
 * @param {string} currentContext - Mevcut bağlam özeti
 * @returns {Promise<string>} - Yeni bağlam özeti
 */
const generateUserContextSummary = async (messages, currentContext = '') => {
  try {
    // Sadece kullanıcı ve asistan mesajlarını al
    const relevantMessages = messages.filter(msg => 
      msg.role === 'user' || msg.role === 'assistant'
    );
    
    // Son 20 mesajı al
    const recentMessages = relevantMessages.slice(-20);
    
    // Mesajları formatla
    const formattedMessages = recentMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Mevcut bağlam varsa ekle
    let prompt = 'Analyze the conversation and create a concise summary of what you know about the user. ';
    
    if (currentContext) {
      prompt += `Here is what you already know about the user: "${currentContext}". `;
    }
    
    prompt += 'Focus on personal details, preferences, interests, and any important information shared. Keep it under 200 words.';
    
    // Özet talimatını ekle
    formattedMessages.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
      }
    );
    
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Kullanıcı bağlamı özeti oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Mesajlardan konuşma konularını çıkar
 * @param {Array} messages - Sohbet mesajları
 * @returns {Promise<Array>} - Konular dizisi
 */
const extractTopics = async (messages) => {
  try {
    // Son 10 mesajı al
    const recentMessages = messages.slice(-10);
    
    // Mesajları birleştir
    const combinedText = recentMessages
      .map(msg => msg.content)
      .join('\n');
    
    // Kısa metinler için konu çıkarma yapma
    if (combinedText.length < 50) return [];
    
    const prompt = `Extract 3-5 main topics from this conversation. Return only a comma-separated list of single words or short phrases without numbering or explanation:\n\n${combinedText}`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        },
      }
    );
    
    const topicsText = response.data.candidates[0].content.parts[0].text.trim();
    
    // Virgülle ayrılmış konuları diziye dönüştür
    return topicsText
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
  } catch (error) {
    console.error('Konu çıkarma hatası:', error);
    return [];
  }
};

/**
 * Kullanıcı-karakter ilişkisini getir
 * @param {string} userId - Kullanıcı ID
 * @param {string} characterId - Karakter ID
 * @returns {Promise<Object>} - İlişki
 */
const getUserCharacterRelation = async (userId, characterId) => {
  try {
    if (!userId || !characterId) return null;
    
    const relation = await UserCharacterRelation.findOne({
      user: userId,
      character: characterId
    });
    
    return relation;
  } catch (error) {
    console.error('İlişki getirme hatası:', error);
    return null;
  }
};

/**
 * Kullanıcının favori karakterlerini getir
 * @param {string} userId - Kullanıcı ID
 * @param {number} limit - Maksimum karakter sayısı
 * @returns {Promise<Array>} - Favori karakterler
 */
const getUserFavoriteCharacters = async (userId, limit = 5) => {
  try {
    if (!userId) return [];
    
    const relations = await UserCharacterRelation.find({ user: userId })
      .sort({ interactionCount: -1 })
      .limit(limit)
      .populate('character', 'name description avatarUrl');
    
    return relations.map(relation => relation.character);
  } catch (error) {
    console.error('Favori karakter getirme hatası:', error);
    return [];
  }
};

module.exports = {
  updateUserContext,
  generateUserContextSummary,
  extractTopics,
  getUserCharacterRelation,
  getUserFavoriteCharacters
}; 