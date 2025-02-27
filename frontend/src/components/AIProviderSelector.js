import { useState, useContext } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Slider, 
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const AIProviderSelector = ({ currentProvider, currentModel, onProviderChange }) => {
  const { user } = useContext(AuthContext);
  const [provider, setProvider] = useState(currentProvider || 'gemini');
  const [model, setModel] = useState(currentModel || '');
  const [temperature, setTemperature] = useState(0.7);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Kullanıcı tercihlerinden sağlayıcı bilgilerini al
  const userProviders = user?.preferences?.aiSettings?.providers || {};
  const isProviderEnabled = (providerName) => {
    return userProviders[providerName]?.enabled || providerName === 'gemini';
  };

  // Sağlayıcıya göre kullanılabilir modelleri belirle
  const getModelsForProvider = (providerName) => {
    switch (providerName) {
      case 'gemini':
        return [
          { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Hızlı)' },
          { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro (Dengeli)' },
          { value: 'gemini-2.0-ultra', label: 'Gemini 2.0 Ultra (Gelişmiş)' }
        ];
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4o (Dengeli)' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Hızlı)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Gelişmiş)' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Gelişmiş)' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Dengeli)' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Hızlı)' }
        ];
      default:
        return [];
    }
  };

  // Sağlayıcı değiştiğinde varsayılan modeli seç
  const handleProviderChange = (event) => {
    const newProvider = event.target.value;
    setProvider(newProvider);
    
    // Sağlayıcı için varsayılan model seç
    const models = getModelsForProvider(newProvider);
    if (models.length > 0) {
      setModel(models[0].value);
    } else {
      setModel('');
    }
    
    // Kullanıcı API anahtarı girişini göster/gizle
    setShowApiKeyInput(newProvider !== 'gemini' && !isProviderEnabled(newProvider));
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handleTemperatureChange = (event, newValue) => {
    setTemperature(newValue);
  };

  const handleApply = () => {
    onProviderChange(provider, model, { temperature });
  };

  const handleSaveApiKey = () => {
    // API anahtarını kaydetme işlemi burada yapılacak
    // Bu örnekte sadece sağlayıcıyı etkinleştiriyoruz
    setShowApiKeyInput(false);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Sağlayıcı Ayarları
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>AI Sağlayıcı</InputLabel>
            <Select
              value={provider}
              onChange={handleProviderChange}
              label="AI Sağlayıcı"
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
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Model</InputLabel>
            <Select
              value={model}
              onChange={handleModelChange}
              label="Model"
            >
              {getModelsForProvider(provider).map((modelOption) => (
                <MenuItem key={modelOption.value} value={modelOption.value}>
                  {modelOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Sıcaklık: {temperature}</Typography>
            <Slider
              value={temperature}
              onChange={handleTemperatureChange}
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: 'Kesin' },
                { value: 0.5, label: 'Dengeli' },
                { value: 1, label: 'Yaratıcı' }
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        </Grid>
        
        {showApiKeyInput && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Anahtarı Gerekli
              </Typography>
              <TextField
                fullWidth
                label="API Anahtarı"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                margin="normal"
                helperText={`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarınızı girin. Anahtarınız sunucuya şifreli olarak kaydedilecektir.`}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveApiKey}
                disabled={!apiKey}
                sx={{ mt: 1 }}
              >
                API Anahtarını Kaydet
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApply}
          disabled={showApiKeyInput}
        >
          Uygula
        </Button>
      </Box>
    </Paper>
  );
};

export default AIProviderSelector; 