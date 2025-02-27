const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'audio', 'video'],
      default: 'text'
    },
    mediaUrl: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    }
  },
  {
    timestamps: false,
  }
);

const chatSchema = mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Yeni Sohbet',
    },
    messages: [messageSchema],
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Misafir kullanıcılar için null olabilir
    },
    guestId: {
      type: String,
      required: false, // Misafir kullanıcılar için bir tanımlayıcı
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true // null değerler için unique kısıtlamasını kaldırır
    },
    isShared: {
      type: Boolean,
      default: false
    },
    summary: {
      type: String,
      default: ''
    },
    tags: [String],
    topics: [String],
    aiProvider: {
      type: String,
      enum: ['gemini', 'openai', 'anthropic'],
      default: 'gemini'
    },
    aiModel: {
      type: String,
      default: 'gemini-2.0-flash'
    },
    aiSettings: {
      temperature: {
        type: Number,
        default: 0.7
      },
      topP: {
        type: Number,
        default: 0.95
      },
      topK: {
        type: Number,
        default: 40
      },
      maxTokens: {
        type: Number,
        default: 1000
      }
    }
  },
  {
    timestamps: true,
  }
);

// Sohbet kaydedilmeden önce lastMessageAt alanını güncelle
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.createdAt || new Date();
  }
  next();
});

// Karakter popülerlik sayacını artır
chatSchema.post('save', async function() {
  if (this.isNew) {
    try {
      const Character = mongoose.model('Character');
      await Character.findByIdAndUpdate(
        this.character,
        { $inc: { 'popularity.chatCount': 1 } }
      );
    } catch (error) {
      console.error('Karakter popülerlik güncellemesi hatası:', error);
    }
  }
});

module.exports = mongoose.model('Chat', chatSchema); 