import React, { useContext } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const NotificationsMenu = ({ anchorEl, open, onClose }) => {
  const {
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    // Bildirimi okundu olarak işaretle
    markNotificationAsRead(notification._id);
    
    // Bildirim tipine göre yönlendirme yap
    if (notification.type === 'chat') {
      navigate(`/chat/${notification.chatId}`);
    } else if (notification.type === 'character') {
      navigate(`/characters/${notification.characterId}`);
    } else if (notification.type === 'system') {
      navigate('/settings');
    }
    
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: tr });
    } else if (diffInHours < 48) {
      return 'Dün';
    } else {
      return format(date, 'd MMM', { locale: tr });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <Avatar sx={{ bgcolor: 'primary.main' }}>C</Avatar>;
      case 'character':
        return <Avatar sx={{ bgcolor: 'secondary.main' }}>K</Avatar>;
      case 'system':
        return <Avatar sx={{ bgcolor: 'warning.main' }}>S</Avatar>;
      default:
        return <Avatar sx={{ bgcolor: 'info.main' }}>B</Avatar>;
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 360,
          maxHeight: 500,
          overflow: 'auto',
          borderRadius: 2,
          mt: 1.5,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bildirimler
          {unreadNotifications > 0 && (
            <Badge
              badgeContent={unreadNotifications}
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box>
          <Tooltip title="Tümünü okundu işaretle">
            <IconButton
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifications === 0}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      
      {notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Henüz bildiriminiz bulunmuyor
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderLeft: notification.isRead ? 'none' : '4px solid',
                  borderColor: 'primary.main',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  {getNotificationIcon(notification.type)}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        pr: 4,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          pr: 4,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {formatNotificationDate(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
            >
              Tüm Bildirimleri Gör
            </Button>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationsMenu; 