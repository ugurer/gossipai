import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Drawer,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import api, { QAResponse } from '../api/client';
import Notification from './Notification';
import MenuIcon from '@mui/icons-material/Menu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';

// Maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface NotificationState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

interface Message {
    type: 'question' | 'answer';
    content: string;
    context?: Array<{
        text: string;
        document_title: string;
        similarity: number;
    }>;
}

const HomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info'
    });

    const showNotification = (message: string, severity: NotificationState['severity']) => {
        setNotification({ open: true, message, severity });
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: MAX_FILE_SIZE,
        onDropRejected: (rejectedFiles) => {
            const errors = rejectedFiles.map(file => {
                if (file.file.size > MAX_FILE_SIZE) {
                    return 'Dosya boyutu çok büyük (maksimum 10MB)';
                }
                return 'Geçersiz dosya türü (sadece PDF)';
            });
            showNotification(errors[0], 'error');
        },
        onDrop: async (acceptedFiles) => {
            try {
                setUploadStatus('Yükleniyor...');
                for (const file of acceptedFiles) {
                    await api.uploadDocument(file);
                }
                setUploadStatus('Dokümanlar başarıyla yüklendi!');
                showNotification('Dokümanlar başarıyla yüklendi!', 'success');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
                setUploadStatus('Yükleme sırasında bir hata oluştu.');
                showNotification(`Yükleme hatası: ${errorMessage}`, 'error');
            }
        }
    });

    const handleQuestionSubmit = async () => {
        if (!question.trim() || loading) return;

        const currentQuestion = question;
        setQuestion('');
        setMessages(prev => [...prev, { type: 'question', content: currentQuestion }]);
        setLoading(true);

        try {
            const response = await api.askQuestion(currentQuestion);
            setMessages(prev => [...prev, {
                type: 'answer',
                content: response.answer,
                context: response.context
            }]);
            
            if (!response.context.length) {
                showNotification('İlgili bir bağlam bulunamadı.', 'warning');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
            showNotification(`Soru cevaplanırken bir hata oluştu: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleQuestionSubmit();
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            {/* Sol Kenar Çubuğu */}
            <Drawer
                variant={isMobile ? 'temporary' : 'persistent'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: 300,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 300,
                        boxSizing: 'border-box',
                        bgcolor: theme.palette.grey[900],
                        color: 'white',
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Hukuki AI Danışman
                        </Typography>
                        {isMobile && (
                            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
                                <CloseIcon />
                            </IconButton>
                        )}
                    </Box>

                    {/* Doküman Yükleme Alanı */}
                    <Paper
                        {...getRootProps()}
                        sx={{
                            p: 3,
                            mb: 2,
                            textAlign: 'center',
                            bgcolor: isDragActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            cursor: 'pointer',
                            border: '2px dashed rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <UploadFileIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography>
                            {isDragActive
                                ? 'Dosyaları buraya bırakın...'
                                : 'PDF Yükle'}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                            Maksimum: 10MB
                        </Typography>
                    </Paper>

                    {uploadStatus && (
                        <Typography sx={{ mt: 2, color: 'primary.light' }}>
                            {uploadStatus}
                        </Typography>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Yüklü Dokümanlar Listesi */}
                    <Paper sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        mt: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FolderIcon sx={{ mr: 1 }} />
                            <Typography variant="subtitle2">
                                Yüklü Dokümanlar
                            </Typography>
                        </Box>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
                        {/* Buraya doküman listesi eklenecek */}
                    </Paper>
                </Box>
            </Drawer>

            {/* Ana İçerik */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Üst Bar */}
                <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    bgcolor: theme.palette.background.paper,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {isMobile && (
                        <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" component="div">
                        Sohbet
                    </Typography>
                </Box>

                {/* Mesaj Alanı */}
                <Box sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {messages.map((message, index) => (
                        <Paper
                            key={index}
                            sx={{
                                p: 2,
                                maxWidth: '80%',
                                alignSelf: message.type === 'question' ? 'flex-end' : 'flex-start',
                                bgcolor: message.type === 'question' 
                                    ? theme.palette.primary.main 
                                    : theme.palette.background.paper,
                                color: message.type === 'question' ? 'white' : 'inherit'
                            }}
                        >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                            {message.type === 'answer' && message.context && message.context.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Kaynaklar:
                                    </Typography>
                                    <List dense>
                                        {message.context.map((ctx, idx) => (
                                            <ListItem key={idx}>
                                                <ListItemText
                                                    primary={ctx.document_title}
                                                    secondary={`Benzerlik: ${(ctx.similarity * 100).toFixed(2)}%`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Paper>
                    ))}
                </Box>

                {/* Soru Giriş Alanı */}
                <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: theme.palette.background.paper
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Hukuki sorunuzu yazın..."
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: theme.palette.background.default
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleQuestionSubmit}
                            disabled={loading || !question.trim() || question.length < 10}
                            sx={{ minWidth: 100 }}
                        >
                            {loading ? <CircularProgress size={24} /> : <SendIcon />}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Bildirim */}
            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={handleNotificationClose}
            />
        </Box>
    );
};

export default HomePage; 