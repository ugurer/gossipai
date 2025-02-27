const mongoose = require('mongoose');

const characterSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen bir karakter adı girin'],
    },
    description: {
      type: String,
      required: [true, 'Lütfen bir karakter açıklaması girin'],
    },
    systemPrompt: {
      type: String,
      required: [true, 'Lütfen bir sistem promptu girin'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    avatarUrl: {
      type: String,
      default: '/images/default-avatar.png'
    },
    mediaUrls: [String], // Karakter ile ilişkili medya dosyaları
    tags: [String], // Karakteri kategorize etmek için etiketler
    rating: {
      averageScore: {
        type: Number,
        default: 0
      },
      totalRatings: {
        type: Number,
        default: 0
      }
    },
    popularity: {
      chatCount: {
        type: Number,
        default: 0
      },
      messageCount: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Character', characterSchema); 