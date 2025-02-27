import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { CharacterProvider } from './context/CharacterContext';
import { ChatProvider } from './context/ChatContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CharacterSelect from './pages/CharacterSelect';
import Chat from './pages/Chat';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CreateCharacter from './pages/CreateCharacter';
import PrivateRoute from './components/PrivateRoute';
import { useState, useMemo } from 'react';

function App() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#3A86FF',
            light: '#5E9DFF',
            dark: '#2A6CD9',
            contrastText: '#fff',
          },
          secondary: {
            main: '#FF7F11',
            light: '#FF9A44',
            dark: '#D66700',
            contrastText: '#fff',
          },
          accent1: {
            main: '#845EC2',
            light: '#A17FD8',
            dark: '#6A4B9C',
          },
          accent2: {
            main: '#2ECC71',
            light: '#54D98C',
            dark: '#25A55B',
          },
          background: {
            default: mode === 'light' ? '#F9F9F9' : '#1B1B3A',
            paper: mode === 'light' ? '#ffffff' : '#252550',
          },
          error: {
            main: '#FF5757',
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 500,
          },
          h6: {
            fontWeight: 500,
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                padding: '10px 24px',
                boxShadow: mode === 'light' ? '0 4px 12px rgba(58, 134, 255, 0.15)' : 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(58, 134, 255, 0.25)',
                },
              },
              containedPrimary: {
                background: 'linear-gradient(45deg, #3A86FF 30%, #5E9DFF 90%)',
              },
              containedSecondary: {
                background: 'linear-gradient(45deg, #FF7F11 30%, #FF9A44 90%)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: mode === 'light' 
                  ? '0 10px 30px rgba(0,0,0,0.08)' 
                  : '0 10px 30px rgba(0,0,0,0.25)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: mode === 'light' 
                    ? '0 15px 35px rgba(58, 134, 255, 0.15)' 
                    : '0 15px 35px rgba(58, 134, 255, 0.25)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              rounded: {
                borderRadius: 20,
              },
              elevation1: {
                boxShadow: mode === 'light'
                  ? '0 3px 10px rgba(0,0,0,0.08)'
                  : '0 3px 10px rgba(0,0,0,0.2)',
              },
              elevation2: {
                boxShadow: mode === 'light'
                  ? '0 6px 15px rgba(0,0,0,0.1)'
                  : '0 6px 15px rgba(0,0,0,0.25)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                background: mode === 'light'
                  ? 'rgba(249, 249, 249, 0.8)'
                  : 'rgba(27, 27, 58, 0.8)',
                backdropFilter: 'blur(10px)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CharacterProvider>
          <ChatProvider>
            <Router>
              <Header toggleColorMode={colorMode.toggleColorMode} currentMode={mode} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/characters" element={<CharacterSelect />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-characters"
                  element={
                    <PrivateRoute>
                      <CharacterSelect userOnly={true} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-character"
                  element={
                    <PrivateRoute>
                      <CreateCharacter />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Router>
          </ChatProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 