const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen bir isim girin'],
    },
    email: {
      type: String,
      required: [true, 'Lütfen bir e-posta girin'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Lütfen bir şifre girin'],
    },
    language: {
      type: String,
      enum: ['tr', 'en', 'de', 'fr', 'es'],
      default: 'tr'
    },
    preferences: {
      favoriteCharacters: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Character'
        }
      ],
      conversationStyle: {
        type: String,
        enum: ['formal', 'casual', 'friendly', 'professional'],
        default: 'friendly'
      },
      interests: [String],
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      aiSettings: {
        defaultProvider: {
          type: String,
          enum: ['gemini', 'openai', 'anthropic'],
          default: 'gemini'
        },
        providers: {
          gemini: {
            enabled: {
              type: Boolean,
              default: true
            },
            apiKey: String,
            model: {
              type: String,
              default: 'gemini-2.0-flash'
            },
            temperature: {
              type: Number,
              default: 0.7,
              min: 0,
              max: 1
            }
          },
          openai: {
            enabled: {
              type: Boolean,
              default: false
            },
            apiKey: String,
            model: {
              type: String,
              default: 'gpt-4o'
            },
            temperature: {
              type: Number,
              default: 0.7,
              min: 0,
              max: 1
            }
          },
          anthropic: {
            enabled: {
              type: Boolean,
              default: false
            },
            apiKey: String,
            model: {
              type: String,
              default: 'claude-3-opus-20240229'
            },
            temperature: {
              type: Number,
              default: 0.7,
              min: 0,
              max: 1
            }
          }
        }
      }
    },
    subscription: {
      type: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free'
      },
      startDate: Date,
      endDate: Date,
      paymentId: String
    },
    credits: {
      type: Number,
      default: 10 // Ücretsiz kullanıcılar için başlangıç kredisi
    },
    lastLogin: Date,
    lastActivity: Date,
    pushTokens: [
      {
        token: String,
        deviceType: {
          type: String,
          enum: ['ios', 'android', 'web'],
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Şifreyi hashleme
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Şifre eşleşme kontrolü
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Kullanıcı giriş yaptığında lastLogin alanını güncelle
userSchema.methods.updateLoginTime = async function() {
  this.lastLogin = new Date();
  this.lastActivity = new Date();
  return this.save();
};

// Kullanıcı aktivitesini güncelle
userSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 