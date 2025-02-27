import React, { useContext, useEffect, useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Box,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Chat as ChatIcon,
  Announcement as AnnouncementIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AuthContext from '../context/AuthContext';

const Notifications = () => {
  const {
    notifications,
    unreadNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Bildirimleri yenile
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }

    // Bildirime tıklandığında yönlendirme
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    handleClose();
  };

  // Bildirim tipine göre ikon seç
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <ChatIcon />;
      case 'system':
        return <InfoIcon />;
      case 'reminder':
        return <AnnouncementIcon />;
      case 'promo':
        return <CampaignIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Bildirim tarihini formatla
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy HH:mm', { locale: tr });
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleClick}
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadNotifications} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bildirimler</Typography>
          {unreadNotifications > 0 && (
            <Button
              startIcon={<MarkEmailReadIcon />}
              size="small"
              onClick={handleMarkAllAsRead}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="Bildiriminiz bulunmuyor" />
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.isRead ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                display: 'block',
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: '40px' }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" component="div">
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" component="div">
                      {notification.message}
                    </Typography>
                  }
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  ml: 5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatNotificationDate(notification.createdAt)}
                </Typography>
                <Box>
                  {!notification.isRead && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default Notifications; 