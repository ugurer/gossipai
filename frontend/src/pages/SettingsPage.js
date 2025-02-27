import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  CreditCard as CreditCardIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AIProviderSelector from '../components/AIProviderSelector';

const SettingsPage = () => {
  const {
    user,
    loading,
    error,
    language,
    changeLanguage,
    updatePreferences,
    updateApiKey,
    updateDefaultProvider,
    buyCredits,
  } = useContext(AuthContext);
  
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'tr');
  const [theme, setTheme] = useState('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // AI API ayarları
  const [apiProvider, setApiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [editingProvider, setEditingProvider] = useState(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Kullanıcı tercihlerini yükle
      setSelectedLanguage(user.language || 'tr');
      setTheme(user.preferences?.theme || 'system');
      
      // Varsayılan AI sağlayıcısını ayarla
      if (user.preferences?.aiSettings?.defaultProvider) {
        setApiProvider(user.preferences.aiSettings.defaultProvider);
      }
    }
  }, [user, navigate]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleLanguageChange = async () => {
    try {
      await changeLanguage(selectedLanguage);
      showSuccessMessage('Dil tercihiniz başarıyla güncellendi');
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };
  
  const handleThemeChange = async () => {
    try {
      await updatePreferences({ theme });
      showSuccessMessage('Tema tercihiniz başarıyla güncellendi');
    } catch (error) {
      console.error('Tema değiştirme hatası:', error);
    }
  };
  
  const handleNotificationSettingsChange = async () => {
    try {
      await updatePreferences({
        notifications: {
          enabled: notificationsEnabled,
          email: emailNotificationsEnabled,
        },
      });
      showSuccessMessage('Bildirim ayarlarınız başarıyla güncellendi');
    } catch (error) {
      console.error('Bildirim ayarları değiştirme hatası:', error);
    }
  };
  
  const handleApiKeySubmit = async () => {
    try {
      await updateApiKey(editingProvider, apiKey);
      setApiKey('');
      setEditingProvider(null);
      showSuccessMessage(`${editingProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarınız başarıyla kaydedildi`);
    } catch (error) {
      console.error('API anahtarı güncelleme hatası:', error);
    }
  };
  
  const handleDefaultProviderChange = async (provider) => {
    try {
      await updateDefaultProvider(provider);
      setApiProvider(provider);
      showSuccessMessage(`Varsayılan AI sağlayıcınız ${provider} olarak güncellendi`);
    } catch (error) {
      console.error('Varsayılan sağlayıcı değiştirme hatası:', error);
    }
  };
  
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setOpenSnackbar(true);
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // Sağlayıcı durumunu kontrol et
  const isProviderEnabled = (provider) => {
    return user?.preferences?.aiSettings?.providers?.[provider]?.enabled || provider === 'gemini';
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ayarlar
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Ayarlar sekmeleri">
          <Tab label="Genel" />
          <Tab label="Bildirimler" />
          <Tab label="AI Sağlayıcılar" />
          <Tab label="Abonelik" />
        </Tabs>
      </Box>
      
      {/* Genel Ayarlar */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Genel Ayarlar
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dil</InputLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  label="Dil"
                >
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleLanguageChange}
                disabled={loading}
              >
                Dili Değiştir
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  label="Tema"
                >
                  <MenuItem value="light">Açık</MenuItem>
                  <MenuItem value="dark">Koyu</MenuItem>
                  <MenuItem value="system">Sistem</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleThemeChange}
                disabled={loading}
              >
                Temayı Değiştir
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Bildirim Ayarları */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bildirim Ayarları
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            }
            label="Bildirimleri Etkinleştir"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                disabled={!notificationsEnabled}
              />
            }
            label="E-posta Bildirimleri"
          />
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleNotificationSettingsChange}
              disabled={loading}
            >
              Bildirim Ayarlarını Kaydet
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* AI Sağlayıcı Ayarları */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Sağlayıcı Ayarları
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Varsayılan AI Sağlayıcısı
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Varsayılan Sağlayıcı</InputLabel>
              <Select
                value={apiProvider}
                onChange={(e) => handleDefaultProviderChange(e.target.value)}
                label="Varsayılan Sağlayıcı"
              >
                <MenuItem value="gemini">Google Gemini</MenuItem>
                <MenuItem value="openai" disabled={!isProviderEnabled('openai')}>
                  OpenAI{!isProviderEnabled('openai') && ' (API Anahtarı Gerekli)'}
                </MenuItem>
                <MenuItem value="anthropic" disabled={!isProviderEnabled('anthropic')}>
                  Anthropic Claude{!isProviderEnabled('anthropic') && ' (API Anahtarı Gerekli)'}
                </MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Varsayılan AI sağlayıcısı, yeni sohbetler başlattığınızda kullanılacaktır.
            </Typography>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            API Anahtarları
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Google Gemini" 
                secondary="Ücretsiz olarak kullanılabilir, API anahtarı gerekmez" 
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" disabled>
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="OpenAI" 
                secondary={isProviderEnabled('openai') ? "API anahtarı yapılandırıldı" : "API anahtarı gerekli"} 
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  onClick={() => {
                    setEditingProvider('openai');
                    setApiKey('');
                  }}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Anthropic Claude" 
                secondary={isProviderEnabled('anthropic') ? "API anahtarı yapılandırıldı" : "API anahtarı gerekli"} 
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  onClick={() => {
                    setEditingProvider('anthropic');
                    setApiKey('');
                  }}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          
          {editingProvider && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {editingProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API Anahtarı
              </Typography>
              <TextField
                fullWidth
                label="API Anahtarı"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                margin="normal"
                helperText={`${editingProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarınızı girin. Anahtarınız sunucuya şifreli olarak kaydedilecektir.`}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey || loading}
                  startIcon={<SaveIcon />}
                >
                  Kaydet
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditingProvider(null)}
                  startIcon={<CancelIcon />}
                >
                  İptal
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Abonelik Ayarları */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Abonelik Bilgileri
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Mevcut Plan: {user.subscription?.type === 'free' ? 'Ücretsiz' : 
                              user.subscription?.type === 'premium' ? 'Premium' : 'Pro'}
              </Typography>
              
              {user.subscription?.type === 'free' ? (
                <Typography variant="body2" color="text.secondary">
                  Ücretsiz planda sınırlı özellikler sunulmaktadır. Premium veya Pro plana geçerek daha fazla özelliğe erişebilirsiniz.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2">
                    Abonelik Başlangıç: {user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : 'Belirtilmemiş'}
                  </Typography>
                  <Typography variant="body2">
                    Abonelik Bitiş: {user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'Belirtilmemiş'}
                  </Typography>
                </>
              )}
              
              <Typography variant="body1" sx={{ mt: 2 }}>
                Mevcut Krediniz: {user.credits || 0}
              </Typography>
            </CardContent>
            <CardActions>
              {user.subscription?.type === 'free' && (
                <Button size="small" color="primary" onClick={() => navigate('/subscription')}>
                  Premium'a Yükselt
                </Button>
              )}
              <Button size="small" color="primary" onClick={() => navigate('/buy-credits')}>
                Kredi Satın Al
              </Button>
            </CardActions>
          </Card>
          
          <Typography variant="subtitle1" gutterBottom>
            Plan Karşılaştırması
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Ücretsiz</Typography>
                  <Typography variant="h5" color="primary" gutterBottom>0 ₺</Typography>
                  <Typography variant="body2">
                    • Günlük 10 mesaj<br />
                    • Gemini AI desteği<br />
                    • Temel özellikler
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Premium</Typography>
                  <Typography variant="h5" color="primary" gutterBottom>49.99 ₺/ay</Typography>
                  <Typography variant="body2">
                    • Sınırsız mesaj<br />
                    • Tüm AI sağlayıcıları<br />
                    • Medya desteği<br />
                    • Sohbet paylaşımı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Pro</Typography>
                  <Typography variant="h5" color="primary" gutterBottom>99.99 ₺/ay</Typography>
                  <Typography variant="body2">
                    • Premium tüm özellikleri<br />
                    • Öncelikli destek<br />
                    • Özel karakterler<br />
                    • API erişimi
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 