import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AuthContext from '../context/AuthContext';

const CreateCharacter = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, description, systemPrompt, isPublic } = formData;

  const onChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isPublic' ? checked : value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.post('/api/characters', formData, config);
      navigate('/my-characters');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Karakter oluşturulurken bir hata oluştu.'
      );
      setLoading(false);
    }
  };

  const promptExamples = [
    {
      title: 'Tarihçi',
      prompt:
        'Sen bir tarih profesörüsün. Türk ve dünya tarihi hakkında derin bilgiye sahipsin. Konuşma tarzın akademik ama anlaşılır. Tarihsel olaylar, dönemler, önemli şahsiyetler ve tarihi gelişmeler hakkında bilgi verebilirsin.',
    },
    {
      title: 'Şef',
      prompt:
        'Sen ünlü bir şefsin. Türk ve dünya mutfağı hakkında geniş bilgiye sahipsin. Yemek tarifleri, pişirme teknikleri, malzemeler ve mutfak hikayeleri hakkında konuşabilirsin. Konuşma tarzın samimi ve tutkulu.',
    },
    {
      title: 'Komik Karakter',
      prompt:
        'Sen bir komedyensin. Her durumda espri yapmayı seven, hayata neşeli bakan birisin. Konuşma tarzın esprili ve enerji dolu. Kelime oyunları yapmayı ve komik benzetmeler kullanmayı seversin.',
    },
  ];

  const setPromptExample = (prompt) => {
    setFormData({
      ...formData,
      systemPrompt: prompt,
    });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Yeni Karakter Oluştur
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Karakter Adı"
            name="name"
            value={name}
            onChange={onChange}
            helperText="Karakterinize bir isim verin"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Açıklama"
            name="description"
            value={description}
            onChange={onChange}
            multiline
            rows={2}
            helperText="Karakterinizi kısaca tanımlayın"
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              Sistem Promptu
              <Tooltip title="Sistem promptu, yapay zeka modelinin nasıl davranacağını belirler. Karakterin kişiliğini, bilgisini ve konuşma tarzını tanımlayın.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>

            <TextField
              required
              fullWidth
              name="systemPrompt"
              value={systemPrompt}
              onChange={onChange}
              multiline
              rows={6}
              placeholder="Karakterinizin davranışını ve bilgisini tanımlayan sistem promptunu yazın..."
              helperText="Örnek: 'Sen bir tarih profesörüsün. Türk ve dünya tarihi hakkında derin bilgiye sahipsin...'"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch checked={isPublic} onChange={onChange} name="isPublic" />
            }
            label="Bu karakteri herkese açık yap (Diğer kullanıcılar görebilir)"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !name || !description || !systemPrompt}
          >
            {loading ? 'Oluşturuluyor...' : 'Karakteri Oluştur'}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Örnek Promptlar
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Aşağıdaki örneklerden birini seçerek başlayabilirsiniz:
          </Typography>

          {promptExamples.map((example, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ p: 2, mb: 2, cursor: 'pointer' }}
              onClick={() => setPromptExample(example.prompt)}
            >
              <Typography variant="subtitle1" gutterBottom>
                {example.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {example.prompt.substring(0, 100)}...
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCharacter; 