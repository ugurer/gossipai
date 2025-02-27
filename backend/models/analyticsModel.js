const mongoose = require('mongoose');

const interactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestId: String,
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    action: {
      type: String,
      enum: ['view', 'chat_start', 'message_sent', 'feedback', 'share', 'search'],
      required: true
    },
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Kullanıcı veya misafir ID'si gerekli
interactionSchema.pre('save', function(next) {
  if (!this.user && !this.guestId) {
    return next(new Error('Kullanıcı veya misafir ID\'si gereklidir'));
  }
  next();
});

// TTL indeksi - 90 gün sonra otomatik silme
interactionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction; 