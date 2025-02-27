import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, error, clearError, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
    setFormError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPassword2 = () => {
    setShowPassword2(!showPassword2);
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Kayıt Ol
        </Typography>

        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || formError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Ad Soyad"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            value={email}
            onChange={onChange}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="şifre görünürlüğünü değiştir"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password2"
                label="Şifre Tekrar"
                type={showPassword2 ? 'text' : 'password'}
                id="password2"
                autoComplete="new-password"
                value={password2}
                onChange={onChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="şifre tekrar görünürlüğünü değiştir"
                        onClick={toggleShowPassword2}
                        edge="end"
                      >
                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!name || !email || !password || !password2}
          >
            Kayıt Ol
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" style={{ color: 'primary.main' }}>
                Giriş Yap
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Kayıt olmadan da karakterlerle sohbet edebilirsiniz.{' '}
          <Link to="/characters" style={{ color: 'primary.main' }}>
            Karakterleri Keşfet
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Register; 