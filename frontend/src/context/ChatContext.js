import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Hem named export hem de default export olarak tanımlıyoruz
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxTokens: 1000
  });

  const { user, guestId } = useContext(AuthContext);

  // Sohbet başlat
  const startChat = async (characterId, message, mediaType = null, mediaUrl = null) => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        characterId,
        message,
        aiProvider,
        aiModel
      };

      // Misafir kullanıcı için guestId ekle
      if (!user && guestId) {
        requestData.guestId = guestId;
      }

      // Medya varsa ekle
      if (mediaType && mediaUrl) {
        requestData.mediaType = mediaType;
        requestData.mediaUrl = mediaUrl;
      }

      const response = await axios.post('/api/chat', requestData);

      const newChat = {
        _id: response.data.chatId,
        messages: [
          {
            role: 'user',
            content: message,
            mediaType,
            mediaUrl,
            createdAt: new Date()
          },
          {
            role: 'assistant',
            content: response.data.reply.content,
            createdAt: new Date(response.data.reply.createdAt)
          }
        ]
      };

      setCurrentChat(newChat);
      setMessages(newChat.messages);
      setChats(prevChats => [newChat, ...prevChats]);
      setLoading(false);
      return newChat;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Sohbet başlatılırken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // Mesaj gönder
  const sendMessage = async (chatId, message, mediaType = null, mediaUrl = null) => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        message
      };

      // AI sağlayıcı ve model bilgilerini ekle
      if (aiProvider !== 'gemini') {
        requestData.aiProvider = aiProvider;
        requestData.aiModel = aiModel;
      }

      // Medya varsa ekle
      if (mediaType && mediaUrl) {
        requestData.mediaType = mediaType;
        requestData.mediaUrl = mediaUrl;
      }

      const response = await axios.post(`/api/chat/${chatId}`, requestData);

      const userMessage = {
        role: 'user',
        content: message,
        mediaType,
        mediaUrl,
        createdAt: new Date()
      };

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply.content,
        createdAt: new Date(response.data.reply.createdAt)
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Mevcut sohbeti güncelle
      setCurrentChat(prevChat => ({
        ...prevChat,
        messages: updatedMessages
      }));

      // Sohbetler listesini güncelle
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId
            ? { ...chat, messages: updatedMessages }
            : chat
        )
      );

      setLoading(false);
      return { userMessage, assistantMessage };
    } catch (error) {
      setError(
        error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // Sohbetleri getir
  const getChats = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/chat';
      
      // Misafir kullanıcı için guestId ekle
      if (!user && guestId) {
        url += `?guestId=${guestId}`;
      }

      const response = await axios.get(url);
      setChats(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Sohbetler getirilirken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // Sohbet detayını getir
  const getChat = async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/chat/${chatId}`;
      
      // Misafir kullanıcı için guestId ekle
      if (!user && guestId) {
        url += `?guestId=${guestId}`;
      }

      const response = await axios.get(url);
      setCurrentChat(response.data);
      setMessages(response.data.messages);
      
      // AI sağlayıcı ve model bilgilerini güncelle
      if (response.data.aiProvider) {
        setAiProvider(response.data.aiProvider);
      }
      
      if (response.data.aiModel) {
        setAiModel(response.data.aiModel);
      }
      
      if (response.data.aiSettings) {
        setAiSettings(response.data.aiSettings);
      }
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Sohbet detayı getirilirken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // Sohbeti sil
  const deleteChat = async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/chat/${chatId}`;
      
      // Misafir kullanıcı için guestId ekle
      if (!user && guestId) {
        url += `?guestId=${guestId}`;
      }

      await axios.delete(url);
      
      // Sohbetler listesini güncelle
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // Eğer silinen sohbet mevcut sohbetse, mevcut sohbeti temizle
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
      
      setLoading(false);
      return chatId;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Sohbet silinirken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // AI sağlayıcısını değiştir
  const changeAiProvider = async (provider, model = null, settings = null) => {
    setAiProvider(provider);
    
    if (model) {
      setAiModel(model);
    } else {
      // Sağlayıcıya göre varsayılan model belirle
      switch (provider) {
        case 'gemini':
          setAiModel('gemini-2.0-flash');
          break;
        case 'openai':
          setAiModel('gpt-4o');
          break;
        case 'anthropic':
          setAiModel('claude-3-opus-20240229');
          break;
        default:
          setAiModel('gemini-2.0-flash');
      }
    }
    
    if (settings) {
      setAiSettings(settings);
    }
    
    // Eğer aktif bir sohbet varsa, sohbetin AI sağlayıcısını güncelle
    if (currentChat) {
      try {
        let url = `/api/chat/${currentChat._id}/provider`;
        
        // Misafir kullanıcı için guestId ekle
        if (!user && guestId) {
          url += `?guestId=${guestId}`;
        }
        
        const requestData = {
          aiProvider: provider,
          aiModel: model || aiModel,
          aiSettings: settings || aiSettings
        };
        
        await axios.put(url, requestData);
        
        // Mevcut sohbeti güncelle
        setCurrentChat(prevChat => ({
          ...prevChat,
          aiProvider: provider,
          aiModel: model || aiModel,
          aiSettings: settings || aiSettings
        }));
        
      } catch (error) {
        setError(
          error.response?.data?.message || 'AI sağlayıcısı güncellenirken bir hata oluştu'
        );
        throw error;
      }
    }
  };

  // Sohbeti paylaş
  const shareChat = async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/chat/${chatId}/share`);
      
      // Mevcut sohbeti güncelle
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(prevChat => ({
          ...prevChat,
          shareToken: response.data.shareToken,
          isShared: true
        }));
      }
      
      // Sohbetler listesini güncelle
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId
            ? { 
                ...chat, 
                shareToken: response.data.shareToken,
                isShared: true 
              }
            : chat
        )
      );
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Sohbet paylaşılırken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  // Paylaşılan sohbeti getir
  const getSharedChat = async (shareToken) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/chat/shared/${shareToken}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Paylaşılan sohbet getirilirken bir hata oluştu'
      );
      setLoading(false);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loading,
        error,
        messages,
        aiProvider,
        aiModel,
        aiSettings,
        startChat,
        sendMessage,
        getChats,
        getChat,
        deleteChat,
        changeAiProvider,
        shareChat,
        getSharedChat,
        setCurrentChat,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 