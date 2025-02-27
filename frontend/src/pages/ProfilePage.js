import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import CharacterContext from '../context/CharacterContext';

const ProfilePage = () => {
  const { user, updatePreferences } = useContext(AuthContext);
  const { getUserFavoriteCharacters } = useContext(CharacterContext);
  
  const [editing, setEditing] = useState(false);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    conversationStyle: '',
    interests: [],
    newInterest: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        conversationStyle: user.preferences?.conversationStyle || 'friendly',
        interests: user.preferences?.interests || [],
        newInterest: '',
      });
      
      // Favori karakterleri yükle
      loadFavoriteCharacters();
      
      // Kullanıcı istatistiklerini yükle
      loadUserStats();
    }
  }, [user]);

  const loadFavoriteCharacters = async () => {
    try {
      const characters = await getUserFavoriteCharacters();
      setFavoriteCharacters(characters);
    } catch (error) {
      console.error('Favori karakterler yüklenirken hata oluştu:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // API endpoint'i olmadığı için sahte veri oluşturalım
      const mockStats = {
        totalChats: 12,
        totalMessages: 145,
        favoriteCharacter: {
          name: "Simitçi",
          count: 25
        }
      };
      
      setUserStats(mockStats);
    } catch (error) {
      console.error('Kullanıcı istatistikleri yüklenirken hata oluştu:', error);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    
    // Düzenleme iptal edilirse, formu sıfırla
    if (editing) {
      setFormData({
        name: user.name || '',
        conversationStyle: user.preferences?.conversationStyle || 'friendly',
        interests: user.preferences?.interests || [],
        newInterest: '',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddInterest = () => {
    if (formData.newInterest.trim() !== '') {
      setFormData({
        ...formData,
        interests: [...formData.interests, formData.newInterest.trim()],
        newInterest: '',
      });
    }
  };

  const handleDeleteInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Kullanıcı tercihlerini güncelle
      const success = await updatePreferences({
        conversationStyle: formData.conversationStyle,
        interests: formData.interests,
      });
      
      if (success) {
        setSnackbar({
          open: true,
          message: 'Profil başarıyla güncellendi',
          severity: 'success',
        });
        setEditing(false);
      } else {
        setSnackbar({
          open: true,
          message: 'Profil güncellenirken bir hata oluştu',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Profil güncellenirken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Profil bilgilerini görüntülemek için giriş yapmalısınız.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Profil
          </Typography>
          <Button
            variant={editing ? 'outlined' : 'contained'}
            color={editing ? 'error' : 'primary'}
            startIcon={editing ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
          >
            {editing ? 'İptal' : 'Düzenle'}
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Kullanıcı Bilgileri */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                alt={user.name}
                src="/static/images/avatar/1.jpg"
              />
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={`${user.subscription.type.toUpperCase()} Üyelik`}
                color={
                  user.subscription.type === 'pro'
                    ? 'success'
                    : user.subscription.type === 'premium'
                    ? 'primary'
                    : 'default'
                }
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Kredi: {user.credits}
              </Typography>
            </Box>
          </Grid>

          {/* Kullanıcı Tercihleri */}
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Tercihler
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editing}>
                    <InputLabel id="conversation-style-label">Konuşma Tarzı</InputLabel>
                    <Select
                      labelId="conversation-style-label"
                      id="conversationStyle"
                      name="conversationStyle"
                      value={formData.conversationStyle}
                      onChange={handleChange}
                      label="Konuşma Tarzı"
                    >
                      <MenuItem value="formal">Resmi</MenuItem>
                      <MenuItem value="casual">Gündelik</MenuItem>
                      <MenuItem value="friendly">Arkadaşça</MenuItem>
                      <MenuItem value="professional">Profesyonel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    İlgi Alanları
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        onDelete={editing ? () => handleDeleteInterest(interest) : undefined}
                      />
                    ))}
                  </Box>
                  {editing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Yeni İlgi Alanı"
                        name="newInterest"
                        value={formData.newInterest}
                        onChange={handleChange}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddInterest}
                      >
                        Ekle
                      </Button>
                    </Box>
                  )}
                </Grid>

                {editing && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                    >
                      Kaydet
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Grid>
        </Grid>

        {/* İstatistikler ve Favori Karakterler */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            İstatistikler ve Favoriler
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* İstatistikler */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Aktivite İstatistikleri" />
                <CardContent>
                  {userStats ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Toplam Sohbet</Typography>
                        <Typography variant="h6">{userStats.totalChats}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Toplam Mesaj</Typography>
                        <Typography variant="h6">{userStats.totalMessages}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">En Çok Konuştuğunuz Karakter</Typography>
                        <Typography variant="body1">
                          {userStats.favoriteCharacter?.name || 'Henüz yok'}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2">Yükleniyor...</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Favori Karakterler */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Favori Karakterler" />
                <CardContent>
                  {favoriteCharacters.length > 0 ? (
                    <Grid container spacing={2}>
                      {favoriteCharacters.map((character) => (
                        <Grid item xs={6} key={character._id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={character.avatarUrl}
                              alt={character.name}
                              sx={{ width: 40, height: 40 }}
                            />
                            <Box>
                              <Typography variant="subtitle2">{character.name}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {character.description.substring(0, 30)}...
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2">
                      Henüz favori karakteriniz bulunmuyor.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 