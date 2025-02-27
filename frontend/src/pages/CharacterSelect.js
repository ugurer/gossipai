import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AuthContext from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';

const CharacterSelect = () => {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const { token, guestId, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const res = await axios.get('/api/characters', config);
        setCharacters(res.data);
        setFilteredCharacters(res.data);
        setLoading(false);
      } catch (err) {
        setError('Karakterler yüklenirken bir hata oluştu.');
        setLoading(false);
        console.error('Karakter yükleme hatası:', err);
      }
    };

    fetchCharacters();
    
    // Eğer kullanıcı giriş yapmışsa veya misafir ID varsa sohbet geçmişini getir
    if (token || guestId) {
      fetchChats();
    }
  }, [token, guestId]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { guestId } };

      const res = await axios.get('/api/chat', config);
      setChats(res.data);
    } catch (err) {
      console.error('Sohbet geçmişi yüklenirken hata:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(
        (character) =>
          character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          character.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCharacters(filtered);
    }
  }, [searchTerm, characters]);

  const handleStartChat = async (characterId) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const res = await axios.post(
        '/api/chat',
        {
          characterId,
          message: 'Merhaba!',
          guestId: !token ? guestId : undefined,
        },
        config
      );

      navigate(`/chat/${res.data.chatId}`);
    } catch (err) {
      setError('Sohbet başlatılırken bir hata oluştu.');
      console.error('Sohbet başlatma hatası:', err);
    }
  };

  const handleContinueChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation(); // Tıklamanın üst öğelere yayılmasını engelle
    
    if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { params: { guestId } };

        await axios.delete(`/api/chat/${chatId}`, config);
        // Sohbet listesini güncelle
        setChats(chats.filter(chat => chat._id !== chatId));
      } catch (err) {
        console.error('Sohbet silinirken hata:', err);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && chats.length === 0) {
      fetchChats();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Sohbet geçmişini tarih formatına göre gruplandır
  const groupChatsByDate = () => {
    const groups = {};
    
    chats.forEach(chat => {
      const date = new Date(chat.updatedAt).toLocaleDateString('tr-TR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
    });
    
    return groups;
  };

  const chatGroups = groupChatsByDate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 4 }}>
        Sohbet
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 4 }}
        variant="fullWidth"
      >
        <Tab 
          label="Karakterler" 
          icon={<ChatIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Sohbet Geçmişi" 
          icon={<HistoryIcon />} 
          iconPosition="start"
          disabled={!token && !guestId}
        />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              sx={{ flexGrow: 1, mr: 2 }}
              variant="outlined"
              placeholder="Karakter ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {isAuthenticated && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-character')}
              >
                Yeni Karakter
              </Button>
            )}
          </Box>

          {filteredCharacters.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                Aradığınız kriterlere uygun karakter bulunamadı.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredCharacters.map((character) => (
                <Grid item xs={12} sm={6} md={4} key={character._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {character.name}
                        </Typography>
                        {character.user ? (
                          <Chip
                            icon={<PersonIcon />}
                            label="Özel"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<ChatIcon />}
                            label="Genel"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {character.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleStartChat(character._id)}
                      >
                        Sohbet Başlat
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {tabValue === 1 && (
        <>
          {loadingChats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : chats.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz hiç sohbetiniz yok.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setTabValue(0)}
                sx={{ mt: 2 }}
              >
                Sohbet Başlat
              </Button>
            </Box>
          ) : (
            <Box>
              {Object.keys(chatGroups).map(date => (
                <Box key={date} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    {date}
                  </Typography>
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    {chatGroups[date].map((chat) => (
                      <React.Fragment key={chat._id}>
                        <ListItem 
                          alignItems="flex-start"
                          onClick={() => handleContinueChat(chat._id)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1,
                          }}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={(e) => handleDeleteChat(chat._id, e)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {chat.character?.name?.charAt(0) || 'C'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={chat.title || `Sohbet ${chat._id.substring(0, 6)}`}
                            secondary={
                              <>
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {chat.character?.name || 'Karakter'}
                                </Typography>
                                {' — '}
                                {chat.messages && chat.messages.length > 0 
                                  ? chat.messages[chat.messages.length - 1]?.content?.substring(0, 60) + '...'
                                  : 'Henüz mesaj yok'}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CharacterSelect; 