const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['chat', 'system', 'reminder', 'promo'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: String,
    expiresAt: Date
  },
  {
    timestamps: true
  }
);

// Otomatik olarak süresi dolmuş bildirimleri temizle
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema); 