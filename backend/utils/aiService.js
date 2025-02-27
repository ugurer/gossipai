const axios = require('axios');

/**
 * AI Servis Sınıfı
 * Farklı AI API'leri için tek bir arayüz sağlar
 */
class AIService {
  /**
   * AI Servis sınıfını başlat
   * @param {string} apiType - Kullanılacak API türü: 'gemini', 'openai', 'anthropic'
   */
  constructor(apiType = 'gemini') {
    this.apiType = apiType;
    this.apiKeys = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY
    };
  }

  /**
   * Mesajları Gemini API formatına dönüştür
   * @param {Array} messages - Mesaj dizisi
   * @returns {Array} - Gemini formatında mesajlar
   */
  formatMessagesForGemini(messages) {
    // Sistem mesajını ayır
    let systemPrompt = '';
    const chatMessages = messages.filter(msg => {
      if (msg.role === 'system') {
        systemPrompt += msg.content + '\n';
        return false;
      }
      return true;
    });

    // Gemini formatında mesajları oluştur
    let formattedMessages = chatMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Eğer sistem promptu varsa, ilk mesaj olarak ekleyelim
    if (systemPrompt) {
      // İlk mesaj olarak user rolünde ekleyelim
      formattedMessages.unshift({
        role: 'user',
        parts: [{ text: `[SYSTEM INSTRUCTION]: ${systemPrompt}\n\nLütfen yukarıdaki sistem talimatlarına göre davran. Bu mesaja cevap verme, sadece kullanıcının sonraki mesajlarına cevap ver.` }],
      });
      
      // Yapay zeka cevabı olarak ekleyelim
      formattedMessages.unshift({
        role: 'model',
        parts: [{ text: 'Anlaşıldı, sistem talimatlarına göre davranacağım.' }],
      });
    }

    return formattedMessages;
  }

  /**
   * Mesajları OpenAI API formatına dönüştür
   * @param {Array} messages - Mesaj dizisi
   * @returns {Array} - OpenAI formatında mesajlar
   */
  formatMessagesForOpenAI(messages) {
    // OpenAI zaten bizim kullandığımız formatı destekliyor
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Mesajları Anthropic API formatına dönüştür
   * @param {Array} messages - Mesaj dizisi
   * @returns {Array} - Anthropic formatında mesajlar
   */
  formatMessagesForAnthropic(messages) {
    // Anthropic de bizim kullandığımız formatı destekliyor
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * AI API'den yanıt al
   * @param {Array} messages - Mesaj dizisi
   * @param {Object} options - API seçenekleri
   * @returns {string} - AI yanıtı
   */
  async generateResponse(messages, options = {}) {
    // API türüne göre uygun metodu çağır
    switch (this.apiType) {
      case 'gemini':
        return await this.generateGeminiResponse(messages, options);
      case 'openai':
        return await this.generateOpenAIResponse(messages, options);
      case 'anthropic':
        return await this.generateAnthropicResponse(messages, options);
      default:
        throw new Error(`Desteklenmeyen API türü: ${this.apiType}`);
    }
  }

  /**
   * Gemini API'den yanıt al
   * @param {Array} messages - Mesaj dizisi
   * @param {Object} options - API seçenekleri
   * @returns {string} - Gemini yanıtı
   */
  async generateGeminiResponse(messages, options = {}) {
    try {
      const apiKey = this.apiKeys.gemini;
      if (!apiKey) {
        throw new Error('Gemini API anahtarı bulunamadı');
      }

      const model = options.model || 'gemini-2.0-flash';
      const formattedMessages = this.formatMessagesForGemini(messages);

      console.log(`Gemini API isteği gönderiliyor: ${model}`);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: formattedMessages,
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxTokens || 1000,
          },
        }
      );

      // API yanıtından metni çıkar
      if (response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        console.error('Beklenmeyen Gemini API yanıtı:', response.data);
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.';
      }
    } catch (error) {
      console.error('Gemini API Hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * OpenAI API'den yanıt al
   * @param {Array} messages - Mesaj dizisi
   * @param {Object} options - API seçenekleri
   * @returns {string} - OpenAI yanıtı
   */
  async generateOpenAIResponse(messages, options = {}) {
    try {
      const apiKey = this.apiKeys.openai;
      if (!apiKey) {
        throw new Error('OpenAI API anahtarı bulunamadı');
      }

      const model = options.model || 'gpt-4o';
      const formattedMessages = this.formatMessagesForOpenAI(messages);

      console.log(`OpenAI API isteği gönderiliyor: ${model}`);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: formattedMessages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          top_p: options.topP || 0.95,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // API yanıtından metni çıkar
      if (response.data.choices && response.data.choices[0] && 
          response.data.choices[0].message && 
          response.data.choices[0].message.content) {
        return response.data.choices[0].message.content;
      } else {
        console.error('Beklenmeyen OpenAI API yanıtı:', response.data);
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.';
      }
    } catch (error) {
      console.error('OpenAI API Hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Anthropic API'den yanıt al
   * @param {Array} messages - Mesaj dizisi
   * @param {Object} options - API seçenekleri
   * @returns {string} - Anthropic yanıtı
   */
  async generateAnthropicResponse(messages, options = {}) {
    try {
      const apiKey = this.apiKeys.anthropic;
      if (!apiKey) {
        throw new Error('Anthropic API anahtarı bulunamadı');
      }

      const model = options.model || 'claude-3-opus-20240229';
      const formattedMessages = this.formatMessagesForAnthropic(messages);

      console.log(`Anthropic API isteği gönderiliyor: ${model}`);
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model,
          messages: formattedMessages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      // API yanıtından metni çıkar
      if (response.data.content && response.data.content[0] && 
          response.data.content[0].text) {
        return response.data.content[0].text;
      } else {
        console.error('Beklenmeyen Anthropic API yanıtı:', response.data);
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.';
      }
    } catch (error) {
      console.error('Anthropic API Hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mesajların özetini oluştur
   * @param {Array} messages - Özetlenecek mesajlar
   * @param {string} systemPrompt - Sistem promptu
   * @returns {string} - Özet metni
   */
  async generateSummary(messages, systemPrompt = '') {
    try {
      // Özet oluşturma için varsayılan olarak Gemini kullanıyoruz
      // Daha hızlı ve daha uygun maliyetli olduğu için
      const apiType = 'gemini';
      const model = 'gemini-2.0-flash';
      
      // Özet oluşturma isteği için mesajları formatla
      let formattedMessages = [];
      
      // Mesajları formatlayalım
      if (apiType === 'gemini') {
        formattedMessages = messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
      } else {
        formattedMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
      
      // Sistem promptu ekle
      if (systemPrompt) {
        if (apiType === 'gemini') {
          formattedMessages.unshift({
            role: 'user',
            parts: [{ text: `[SYSTEM CONTEXT]: ${systemPrompt}` }],
          });
        } else {
          formattedMessages.unshift({
            role: 'system',
            content: systemPrompt
          });
        }
      }
      
      // Özet oluşturma talimatı
      if (apiType === 'gemini') {
        formattedMessages.push({
          role: 'user',
          parts: [{ text: 'Lütfen yukarıdaki konuşmayı kısa ve öz bir şekilde özetle. Önemli bilgileri, soruları ve cevapları içer. Özet 200 kelimeyi geçmemelidir.' }],
        });
      } else {
        formattedMessages.push({
          role: 'user',
          content: 'Lütfen yukarıdaki konuşmayı kısa ve öz bir şekilde özetle. Önemli bilgileri, soruları ve cevapları içer. Özet 200 kelimeyi geçmemelidir.'
        });
      }
      
      // API'ye istek gönder
      let response;
      
      if (apiType === 'gemini') {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKeys.gemini}`,
          {
            contents: formattedMessages,
            generationConfig: {
              temperature: 0.3, // Daha deterministik bir yanıt için düşük sıcaklık
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 300,
            },
          }
        );
        
        return response.data.candidates[0].content.parts[0].text;
      } else if (apiType === 'openai') {
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: model,
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 300,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.openai}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data.choices[0].message.content;
      } else if (apiType === 'anthropic') {
        response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: model,
            messages: formattedMessages,
            max_tokens: 300,
            temperature: 0.3,
          },
          {
            headers: {
              'x-api-key': this.apiKeys.anthropic,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data.content[0].text;
      }
    } catch (error) {
      console.error('Özet oluşturma hatası:', error);
      throw error;
    }
  }
}

module.exports = AIService; 