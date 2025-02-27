const mongoose = require('mongoose');

const relationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    userContext: {
      type: String,
      default: '' // Kullanıcı hakkında karakter ne biliyor
    },
    topics: [String], // Konuşulan konular
    lastInteractionAt: {
      type: Date,
      default: Date.now
    },
    interactionCount: {
      type: Number,
      default: 0
    },
    favoriteStatus: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Bir kullanıcı-karakter ilişkisi benzersiz olmalı
relationSchema.index({ user: 1, character: 1 }, { unique: true });

const UserCharacterRelation = mongoose.model('UserCharacterRelation', relationSchema);

module.exports = UserCharacterRelation; 