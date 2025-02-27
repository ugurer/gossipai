import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Chip,
  Drawer,
  useMediaQuery,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AuthContext from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const { id } = useParams();
  const { token, guestId } = useContext(AuthContext);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '' });
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const recognition = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);

  // Sayfa yüklendiğinde sohbeti getir
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { params: { guestId } };

        const res = await axios.get(`/api/chat/${id}`, config);
        setChat(res.data);
        setLoading(false);
      } catch (err) {
        setError('Sohbet yüklenirken bir hata oluştu.');
        setLoading(false);
        console.error('Sohbet yükleme hatası:', err);
      }
    };

    fetchChat();

    // Konuşma tanıma API'sinin desteklenip desteklenmediğini kontrol et
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'tr-TR';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Konuşma tanıma hatası:', event.error);
        setListening(false);
        setNotification({
          open: true,
          message: 'Ses tanıma sırasında bir hata oluştu.'
        });
      };

      recognition.current.onend = () => {
        setListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, [id, token, guestId]);

  // Mesajlar güncellendiğinde otomatik olarak en alta kaydır ve yazma alanına odaklan
  useEffect(() => {
    scrollToBottom();
    // Mesaj gönderildikten sonra yazma alanına odaklan
    if (!waitingResponse && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chat?.messages, waitingResponse]);

  // Sayfa yüklendiğinde yazma alanına odaklan
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Mesaj tarihini formatla
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      // Geçerli bir tarih mi kontrol et
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || waitingResponse) return;

    // Şu anki zamanı al
    const now = new Date();

    const userMessage = {
      role: 'user',
      content: message,
      createdAt: now.toISOString()
    };

    // Önce kullanıcı mesajını ekrana düşür
    setChat((prevChat) => ({
      ...prevChat,
      messages: [
        ...prevChat.messages,
        userMessage,
      ],
    }));

    // Mesaj kutusunu temizle ve bekleme durumunu ayarla
    const sentMessage = message;
    setMessage('');
    setSending(true);
    setWaitingResponse(true);
    setError(null);

    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { guestId } };

      const res = await axios.post(
        `/api/chat/${id}`,
        { message: sentMessage },
        config
      );

      // API'den gelen yanıta createdAt ekle
      const aiResponse = {
        ...res.data.reply,
        createdAt: new Date().toISOString()
      };

      // Sadece AI yanıtını ekle (kullanıcı mesajı zaten eklenmiş durumda)
      setChat((prevChat) => ({
        ...prevChat,
        messages: [
          ...prevChat.messages,
          aiResponse,
        ],
      }));
    } catch (err) {
      setError('Mesaj gönderilirken bir hata oluştu.');
      console.error('Mesaj gönderme hatası:', err);
    } finally {
      setSending(false);
      setWaitingResponse(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      recognition.current.stop();
      setListening(false);
    } else {
      recognition.current.start();
      setListening(true);
      setNotification({
        open: true,
        message: 'Dinleniyor... Konuşmaya başlayın.'
      });
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { params: { guestId } };

        await axios.delete(`/api/chat/${id}`, config);
        setNotification({
          open: true,
          message: 'Sohbet başarıyla silindi.'
        });
        setTimeout(() => navigate('/characters'), 1500);
      } catch (err) {
        setError('Sohbet silinirken bir hata oluştu.');
        console.error('Sohbet silme hatası:', err);
      }
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const toggleInfoDrawer = () => {
    setInfoOpen(!infoOpen);
  };

  // Mesaj gönderme formu
  const renderMessageForm = () => (
    <Box
      component="form"
      onSubmit={handleSendMessage}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
      }}
    >
      {speechSupported && (
        <Tooltip title={listening ? 'Dinlemeyi Durdur' : 'Sesli Giriş'}>
          <IconButton
            onClick={toggleListening}
            color={listening ? 'secondary' : 'default'}
            disabled={waitingResponse}
            sx={{
              mr: 1,
              animation: listening ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(220, 0, 78, 0.4)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(220, 0, 78, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(220, 0, 78, 0)',
                },
              },
            }}
          >
            {listening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
      )}
      <TextField
        fullWidth
        placeholder={waitingResponse ? "Yanıt bekleniyor..." : "Mesajınızı yazın..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={waitingResponse}
        variant="outlined"
        size="medium"
        inputRef={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        sx={{
          mr: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        }}
      />
      <IconButton
        color="primary"
        disabled={!message.trim() || waitingResponse}
        type="submit"
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
        }}
      >
        {waitingResponse ? <CircularProgress size={24} /> : <SendIcon />}
      </IconButton>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Sohbet yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (!chat) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Sohbet bulunamadı veya erişim izniniz yok.
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/characters')}
              sx={{ 
                mt: 2,
                borderRadius: 2,
                py: 1,
                px: 3,
                fontWeight: 600,
              }}
            >
              Karakterlere Dön
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, md: 4 }, 
        mb: { xs: 2, md: 4 },
        height: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 160px)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Sohbet Başlığı */}
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                onClick={() => navigate('/characters')}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 0 10px rgba(144, 202, 249, 0.5)' 
                    : '0 0 10px rgba(25, 118, 210, 0.3)',
                }}
              >
                {chat.character.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {chat.character.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(chat.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Karakter Bilgisi">
                <IconButton color="inherit" onClick={toggleInfoDrawer}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sohbeti Sil">
                <IconButton color="inherit" onClick={handleDeleteChat}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Hata Mesajı */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ m: 2, borderRadius: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {/* Sohbet Mesajları */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: { xs: 2, md: 3 },
              bgcolor: alpha(theme.palette.background.default, 0.5),
              backgroundImage: theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 25% 25%, rgba(53, 53, 53, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle at 25% 25%, rgba(240, 240, 240, 0.6) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(25, 118, 210, 0.05) 0%, transparent 50%)',
            }}
          >
            {chat.messages
              .filter((msg) => msg.role !== 'system')
              .map((msg, index) => (
                <Zoom 
                  in={true} 
                  key={index}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    transformOrigin: msg.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      mb: 2,
                      maxWidth: '85%',
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      ml: msg.role === 'user' ? 'auto' : 0,
                      mr: msg.role === 'user' ? 0 : 'auto',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: msg.role === 'user' ? theme.palette.secondary.main : theme.palette.primary.main,
                        width: 36,
                        height: 36,
                        ml: msg.role === 'user' ? 1 : 0,
                        mr: msg.role === 'user' ? 0 : 1,
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 0 10px rgba(0, 0, 0, 0.3)' 
                          : '0 0 10px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {msg.role === 'user' ? 'S' : chat.character.name.charAt(0)}
                    </Avatar>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        maxWidth: 'calc(100% - 50px)',
                        bgcolor: msg.role === 'user'
                          ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)
                          : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                        border: `1px solid ${
                          msg.role === 'user'
                            ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
                            : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
                        }`,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 12,
                          [msg.role === 'user' ? 'right' : 'left']: -8,
                          width: 0,
                          height: 0,
                          borderStyle: 'solid',
                          borderWidth: msg.role === 'user' ? '8px 0 8px 8px' : '8px 8px 8px 0',
                          borderColor: msg.role === 'user'
                            ? `transparent transparent transparent ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`
                            : `transparent ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)} transparent transparent`,
                        },
                      }}
                    >
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {msg.role === 'user' ? 'Siz' : chat.character.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatMessageTime(msg.createdAt)}
                        </Typography>
                      </Box>
                      <Box className="markdown-content">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </Box>
                    </Paper>
                  </Box>
                </Zoom>
              ))}
            
            {/* Yanıt beklerken yükleniyor animasyonu */}
            {waitingResponse && (
              <Zoom in={true}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    mb: 2,
                    maxWidth: '85%',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 36,
                      height: 36,
                      mr: 1,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 0 10px rgba(0, 0, 0, 0.3)' 
                        : '0 0 10px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {chat.character.name.charAt(0)}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      maxWidth: 'calc(100% - 50px)',
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 12,
                        left: -8,
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: '8px 8px 8px 0',
                        borderColor: `transparent ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)} transparent transparent`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        '& .dot': {
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          opacity: 0.7,
                          animation: 'pulse 1.5s infinite',
                          '&:nth-of-type(2)': {
                            animationDelay: '0.3s',
                          },
                          '&:nth-of-type(3)': {
                            animationDelay: '0.6s',
                          },
                        },
                        '@keyframes pulse': {
                          '0%, 100%': {
                            transform: 'scale(1)',
                            opacity: 0.7,
                          },
                          '50%': {
                            transform: 'scale(1.2)',
                            opacity: 1,
                          },
                        },
                      }}>
                        <Box className="dot" />
                        <Box className="dot" />
                        <Box className="dot" />
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Zoom>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Mesaj Gönderme Formu */}
          {renderMessageForm()}
        </Paper>
      </Fade>

      {/* Karakter Bilgisi Drawer */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={infoOpen}
        onClose={toggleInfoDrawer}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 350,
            borderRadius: isMobile ? '16px 16px 0 0' : 0,
            maxHeight: isMobile ? '70vh' : '100%',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Karakter Bilgisi
            </Typography>
            <IconButton onClick={toggleInfoDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 60,
                height: 60,
                mr: 2,
              }}
            >
              {chat.character.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{chat.character.name}</Typography>
              <Chip 
                label={chat.character.isPublic ? 'Herkese Açık' : 'Özel'} 
                size="small" 
                color={chat.character.isPublic ? 'success' : 'secondary'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Açıklama
          </Typography>
          <Typography variant="body2" paragraph>
            {chat.character.description}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Oluşturulma Tarihi
          </Typography>
          <Typography variant="body2" paragraph>
            {new Date(chat.character.createdAt).toLocaleDateString('tr-TR')}
          </Typography>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={toggleInfoDrawer}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Kapat
          </Button>
        </Box>
      </Drawer>

      {/* Bildirim */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      />
    </Container>
  );
};

export default Chat; 