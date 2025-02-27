import { useState, useEffect, useRef, useContext } from 'react';
import { Box, TextField, Button, Typography, Paper, Avatar, IconButton, Menu, MenuItem, Tooltip, Select, FormControl, InputLabel } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AIProviderSelector from './AIProviderSelector';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentChat,
    loading,
    error,
    messages,
    aiProvider,
    aiModel,
    sendMessage,
    getChat,
    deleteChat,
    shareChat,
    changeAiProvider,
  } = useContext(ChatContext);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (id) {
      getChat(id);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    try {
      await sendMessage(id, message);
      setMessage('');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      try {
        await deleteChat(id);
        navigate('/');
      } catch (error) {
        console.error('Sohbet silme hatası:', error);
      }
    }
  };

  const handleShare = async () => {
    handleMenuClose();
    try {
      const result = await shareChat(id);
      if (result) {
        const shareUrl = `${window.location.origin}/shared/${result.shareToken}`;
        navigator.clipboard.writeText(shareUrl);
        alert(`Paylaşım bağlantısı panoya kopyalandı: ${shareUrl}`);
      }
    } catch (error) {
      console.error('Sohbet paylaşma hatası:', error);
    }
  };

  const handleSettingsToggle = () => {
    handleMenuClose();
    setShowSettings(!showSettings);
  };

  const handleProviderChange = async (provider, model) => {
    try {
      await changeAiProvider(provider, model);
    } catch (error) {
      console.error('AI sağlayıcı değiştirme hatası:', error);
    }
  };

  if (!currentChat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Sohbet yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6">
          {currentChat.character?.name ? `${currentChat.character.name} ile Sohbet` : 'Sohbet'}
        </Typography>
        <Box>
          <Tooltip title="Sohbet Menüsü">
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleSettingsToggle}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              AI Ayarları
            </MenuItem>
            {user && (
              <MenuItem onClick={handleShare}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                Sohbeti Paylaş
              </MenuItem>
            )}
            <MenuItem onClick={handleDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Sohbeti Sil
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {showSettings && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <AIProviderSelector 
            currentProvider={aiProvider} 
            currentModel={aiModel} 
            onProviderChange={handleProviderChange} 
          />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((msg, index) => {
          if (msg.role === 'system') return null;
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                }}
              >
                {msg.mediaType && msg.mediaType !== 'text' && (
                  <Box sx={{ mb: 1 }}>
                    {msg.mediaType.startsWith('image') ? (
                      <img src={msg.mediaUrl} alt="Shared media" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                    ) : (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                        Ek Dosya
                      </a>
                    )}
                  </Box>
                )}
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={materialDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', color: 'text.secondary' }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Mesajınızı yazın..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          type="submit"
          disabled={loading || message.trim() === ''}
        >
          Gönder
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface; 