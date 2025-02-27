import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';

const Header = ({ toggleColorMode, currentMode }) => {
  const { user, logout, unreadNotifications } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'light' 
          ? 'rgba(249, 249, 249, 0.85)' 
          : 'rgba(27, 27, 58, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
              borderRadius: '12px',
              '&:hover': {
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'primary.main',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main', fontSize: '2rem' }} />
            GossipAI
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ 
                my: 2, 
                color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary', 
                display: 'flex', 
                alignItems: 'center', 
                mx: 1,
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                }
              }}
            >
              <HomeIcon sx={{ mr: 0.5, color: 'primary.main' }} />
              Ana Sayfa
            </Button>
            <Button
              component={RouterLink}
              to="/characters"
              sx={{ 
                my: 2, 
                color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary', 
                display: 'flex', 
                alignItems: 'center', 
                mx: 1,
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                }
              }}
            >
              <ChatIcon sx={{ mr: 0.5, color: 'primary.main' }} />
              Sohbet
            </Button>
            {user && (
              <Button
                component={RouterLink}
                to="/my-characters"
                sx={{ 
                  my: 2, 
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary', 
                  display: 'flex', 
                  alignItems: 'center', 
                  mx: 1,
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                  }
                }}
              >
                <FavoriteIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                Favorilerim
              </Button>
            )}
          </Box>

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme Toggle */}
            <IconButton 
              onClick={toggleColorMode} 
              color="primary" 
              sx={{ 
                ml: 1,
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'rotate(30deg)',
                  background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                }
              }}
            >
              {theme.palette.mode === 'dark' ? <LightIcon /> : <DarkIcon />}
            </IconButton>

            {/* Notifications */}
            {user && (
              <Tooltip title="Bildirimler">
                <IconButton
                  onClick={handleOpenNotifications}
                  color="primary"
                  sx={{ 
                    ml: 1,
                    background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                      boxShadow: '0 4px 8px rgba(58, 134, 255, 0.2)'
                    }
                  }}
                >
                  <Badge 
                    badgeContent={unreadNotifications} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #FF5757 30%, #FF7F11 90%)',
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User Menu */}
            {user ? (
              <Box sx={{ ml: 1 }}>
                <Tooltip title="Profil">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0.5,
                      background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                      borderRadius: '14px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                      }
                    }}
                  >
                    <Avatar 
                      alt={user.name} 
                      src={user.avatar || '/static/images/avatar/default.jpg'} 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ 
                    mt: '45px',
                    '& .MuiPaper-root': {
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem 
                    onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      my: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(58, 134, 255, 0.08)',
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText>Profil</ListItemText>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      my: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(58, 134, 255, 0.08)',
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <SettingsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText>Ayarlar</ListItemText>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      my: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255, 87, 87, 0.08)',
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText>Çıkış Yap</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                sx={{ 
                  ml: 1,
                  background: 'linear-gradient(45deg, #3A86FF 30%, #5E9DFF 90%)',
                  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 16px rgba(58, 134, 255, 0.4)'
                  }
                }}
              >
                Giriş Yap
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 20px 20px 0',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #F9F9F9 0%, #F0F7FF 100%)' 
              : 'linear-gradient(135deg, #1B1B3A 0%, #252550 100%)',
          }
        }}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main', fontSize: '2rem' }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              GossipAI
            </Typography>
          </Box>
          <Divider sx={{ mx: 2 }} />
          <List sx={{ px: 1, py: 2 }}>
            <ListItem 
              button 
              component={RouterLink} 
              to="/"
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                color: 'primary.main',
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(5px)',
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                }
              }}
            >
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Ana Sayfa" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/characters"
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                color: 'primary.main',
                background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(5px)',
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                }
              }}
            >
              <ListItemIcon>
                <ChatIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Sohbet" />
            </ListItem>
            {user && (
              <ListItem 
                button 
                component={RouterLink} 
                to="/my-characters"
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: 'primary.main',
                  background: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.08)' : 'rgba(58, 134, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    bgcolor: theme.palette.mode === 'light' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.25)',
                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <FavoriteIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Favorilerim" />
              </ListItem>
            )}
          </List>
          <Divider sx={{ mx: 2 }} />
          {user ? (
            <List sx={{ px: 1, py: 2 }}>
              <ListItem 
                button 
                component={RouterLink} 
                to="/profile"
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    bgcolor: 'rgba(58, 134, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItem>
              <ListItem 
                button 
                component={RouterLink} 
                to="/settings"
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    bgcolor: 'rgba(58, 134, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  <SettingsIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Ayarlar" />
              </ListItem>
              <ListItem 
                button 
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    bgcolor: 'rgba(255, 87, 87, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Çıkış Yap" />
              </ListItem>
            </List>
          ) : (
            <List sx={{ px: 1, py: 2 }}>
              <ListItem 
                button 
                component={RouterLink} 
                to="/login"
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  background: 'linear-gradient(45deg, #3A86FF 30%, #5E9DFF 90%)',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
                  }
                }}
              >
                <ListItemIcon>
                  <LoginIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Giriş Yap" />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>

      {/* Notifications Menu */}
      <NotificationsMenu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleCloseNotifications}
      />
    </AppBar>
  );
};

export default Header; 