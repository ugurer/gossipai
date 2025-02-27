const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String
  },
  {
    timestamps: true
  }
);

// Bir kullanıcı bir karakteri sadece bir kez derecelendirebilir
ratingSchema.index({ user: 1, character: 1 }, { unique: true });

// Derecelendirme eklendiğinde karakter ortalama puanını güncelle
ratingSchema.post('save', async function() {
  try {
    const Character = mongoose.model('Character');
    
    // Bu karakter için tüm derecelendirmeleri bul
    const Rating = mongoose.model('Rating');
    const ratings = await Rating.find({ character: this.character });
    
    // Ortalama puanı hesapla
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
    
    // Karakteri güncelle
    await Character.findByIdAndUpdate(
      this.character,
      { 
        'rating.averageScore': averageRating,
        'rating.totalRatings': ratings.length
      }
    );
  } catch (error) {
    console.error('Karakter derecelendirme güncellemesi hatası:', error);
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating; 