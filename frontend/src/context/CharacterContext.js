import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Hem named export hem de default export olarak tanımlıyoruz
export const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [userCharacters, setUserCharacters] = useState([]);
  const [popularCharacters, setPopularCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tüm karakterleri getir
  const getCharacters = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('/api/characters');
      setCharacters(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakterler alınırken bir hata oluştu');
      setLoading(false);
      return [];
    }
  };

  // Popüler karakterleri getir
  const getPopularCharacters = async (limit = 5) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/characters/popular?limit=${limit}`);
      setPopularCharacters(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Popüler karakterler alınırken hata oluştu:', err);
      setLoading(false);
      return [];
    }
  };

  // Kullanıcının karakterlerini getir
  const getUserCharacters = async () => {
    try {
      if (!token) {
        setUserCharacters([]);
        return [];
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get('/api/characters/user', config);
      setUserCharacters(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı karakterleri alınırken bir hata oluştu');
      setLoading(false);
      return [];
    }
  };

  // Karakter detayını getir
  const getCharacter = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/characters/${id}`);
      setCurrentCharacter(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakter detayı alınırken bir hata oluştu');
      setLoading(false);
      return null;
    }
  };

  // Karakter oluştur
  const createCharacter = async (characterData) => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmalısınız');
        return null;
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post('/api/characters', characterData, config);
      
      // Kullanıcı karakterlerini güncelle
      setUserCharacters([res.data, ...userCharacters]);
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakter oluşturulurken bir hata oluştu');
      setLoading(false);
      return null;
    }
  };

  // Karakter güncelle
  const updateCharacter = async (id, characterData) => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmalısınız');
        return null;
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.put(`/api/characters/${id}`, characterData, config);
      
      // Kullanıcı karakterlerini güncelle
      setUserCharacters(
        userCharacters.map((character) =>
          character._id === id ? res.data : character
        )
      );
      
      // Mevcut karakteri güncelle
      if (currentCharacter && currentCharacter._id === id) {
        setCurrentCharacter(res.data);
      }
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakter güncellenirken bir hata oluştu');
      setLoading(false);
      return null;
    }
  };

  // Karakter sil
  const deleteCharacter = async (id) => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmalısınız');
        return false;
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/characters/${id}`, config);
      
      // Kullanıcı karakterlerini güncelle
      setUserCharacters(userCharacters.filter((character) => character._id !== id));
      
      // Mevcut karakter siliniyorsa, temizle
      if (currentCharacter && currentCharacter._id === id) {
        setCurrentCharacter(null);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakter silinirken bir hata oluştu');
      setLoading(false);
      return false;
    }
  };

  // Karakter derecelendir
  const rateCharacter = async (characterId, rating, comment = '') => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmalısınız');
        return false;
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post('/api/ratings', { characterId, rating, comment }, config);
      
      // Karakter derecelendirmesini güncelle
      if (currentCharacter && currentCharacter._id === characterId) {
        // Mevcut derecelendirme bilgilerini al
        const { rating: currentRating } = currentCharacter;
        
        // Yeni ortalama puanı hesapla
        const newTotalRatings = (currentRating.totalRatings || 0) + 1;
        const newAverageScore = (
          (currentRating.averageScore || 0) * (currentRating.totalRatings || 0) + rating
        ) / newTotalRatings;
        
        // Karakteri güncelle
        setCurrentCharacter({
          ...currentCharacter,
          rating: {
            averageScore: newAverageScore,
            totalRatings: newTotalRatings
          }
        });
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Karakter derecelendirilirken bir hata oluştu');
      setLoading(false);
      return false;
    }
  };

  // Karakter derecelendirmelerini getir
  const getCharacterRatings = async (characterId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/ratings/character/${characterId}`);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Derecelendirmeler alınırken hata oluştu:', err);
      setLoading(false);
      return [];
    }
  };

  // Karakter avatar yükle
  const uploadAvatar = async (characterId, file) => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmalısınız');
        return null;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post(`/api/characters/${characterId}/avatar`, formData, config);
      
      // Karakter avatarını güncelle
      if (currentCharacter && currentCharacter._id === characterId) {
        setCurrentCharacter({
          ...currentCharacter,
          avatarUrl: res.data.avatarUrl
        });
      }
      
      // Kullanıcı karakterlerini güncelle
      setUserCharacters(
        userCharacters.map((character) =>
          character._id === characterId 
            ? { ...character, avatarUrl: res.data.avatarUrl } 
            : character
        )
      );
      
      return res.data.avatarUrl;
    } catch (err) {
      console.error('Avatar yüklenirken hata oluştu:', err);
      return null;
    }
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  // Kullanıcının favori karakterlerini getir
  const getUserFavoriteCharacters = async () => {
    try {
      if (!token) {
        return [];
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Şimdilik popüler karakterleri döndürelim, gerçek API endpoint'i olmadığı için
      const characters = await getCharacters();
      setLoading(false);
      
      // İlk 5 karakteri döndür
      return characters.slice(0, 5);
    } catch (err) {
      console.error('Favori karakterler alınırken hata oluştu:', err);
      setLoading(false);
      return [];
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        userCharacters,
        popularCharacters,
        currentCharacter,
        loading,
        error,
        getCharacters,
        getPopularCharacters,
        getUserCharacters,
        getCharacter,
        createCharacter,
        updateCharacter,
        deleteCharacter,
        clearError,
        rateCharacter,
        getCharacterRatings,
        uploadAvatar,
        getUserFavoriteCharacters,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterContext;