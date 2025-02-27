const Interaction = require('../models/analyticsModel');

/**
 * Kullanıcı etkileşimini kaydet
 * @param {string} userId - Kullanıcı ID (opsiyonel)
 * @param {string} guestId - Misafir ID (opsiyonel)
 * @param {string} characterId - Karakter ID (opsiyonel)
 * @param {string} action - Eylem tipi
 * @param {Object} metadata - Ek bilgiler
 * @returns {Promise<Object>} - Kaydedilen etkileşim
 */
const logInteraction = async (userId, guestId, characterId, action, metadata = {}) => {
  try {
    const interaction = await Interaction.create({
      user: userId || null,
      guestId: !userId ? guestId : null,
      character: characterId || null,
      action,
      metadata,
      timestamp: new Date()
    });
    
    return interaction;
  } catch (error) {
    console.error('Etkileşim kaydı hatası:', error);
    // Hata durumunda işlemi kesme, sadece loglama yap
    return null;
  }
};

/**
 * Popüler karakterleri getir
 * @param {number} limit - Maksimum karakter sayısı
 * @param {number} days - Son kaç günün verisi
 * @returns {Promise<Array>} - Popüler karakterler
 */
const getPopularCharacters = async (limit = 10, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await Interaction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          character: { $ne: null },
          action: { $in: ['chat_start', 'message_sent'] }
        }
      },
      {
        $group: {
          _id: '$character',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'characters',
          localField: '_id',
          foreignField: '_id',
          as: 'characterDetails'
        }
      },
      {
        $unwind: '$characterDetails'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$characterDetails.name',
          description: '$characterDetails.description',
          avatarUrl: '$characterDetails.avatarUrl'
        }
      }
    ]);
    
    return result;
  } catch (error) {
    console.error('Popüler karakter analizi hatası:', error);
    return [];
  }
};

/**
 * Popüler konuşma konularını getir
 * @param {number} limit - Maksimum konu sayısı
 * @returns {Promise<Array>} - Popüler konular
 */
const getPopularTopics = async (limit = 10) => {
  try {
    const result = await Interaction.aggregate([
      {
        $match: {
          action: 'message_sent',
          'metadata.topics': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$metadata.topics'
      },
      {
        $group: {
          _id: '$metadata.topics',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    return result;
  } catch (error) {
    console.error('Popüler konu analizi hatası:', error);
    return [];
  }
};

/**
 * Kullanıcı aktivite istatistiklerini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<Object>} - Kullanıcı istatistikleri
 */
const getUserStats = async (userId) => {
  try {
    const totalChats = await Interaction.countDocuments({
      user: userId,
      action: 'chat_start'
    });
    
    const totalMessages = await Interaction.countDocuments({
      user: userId,
      action: 'message_sent'
    });
    
    const favoriteCharacter = await Interaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          character: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$character',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: 'characters',
          localField: '_id',
          foreignField: '_id',
          as: 'characterDetails'
        }
      },
      {
        $unwind: '$characterDetails'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$characterDetails.name'
        }
      }
    ]);
    
    return {
      totalChats,
      totalMessages,
      favoriteCharacter: favoriteCharacter.length > 0 ? favoriteCharacter[0] : null
    };
  } catch (error) {
    console.error('Kullanıcı istatistikleri hatası:', error);
    return {
      totalChats: 0,
      totalMessages: 0,
      favoriteCharacter: null
    };
  }
};

module.exports = {
  logInteraction,
  getPopularCharacters,
  getPopularTopics,
  getUserStats
}; 