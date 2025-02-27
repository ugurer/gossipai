import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import AuthContext from '../context/AuthContext';

const MyCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    isPublic: false,
  });
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCharacters = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get('/api/characters/me', config);
        setCharacters(res.data);
        setLoading(false);
      } catch (err) {
        setError('Karakterleriniz yüklenirken bir hata oluştu.');
        setLoading(false);
        console.error('Karakter yükleme hatası:', err);
      }
    };

    fetchMyCharacters();
  }, [token]);

  const handleStartChat = async (characterId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.post(
        '/api/chat',
        {
          characterId,
          message: 'Merhaba!',
        },
        config
      );

      navigate(`/chat/${res.data.chatId}`);
    } catch (err) {
      setError('Sohbet başlatılırken bir hata oluştu.');
      console.error('Sohbet başlatma hatası:', err);
    }
  };

  const handleDeleteClick = (character) => {
    setSelectedCharacter(character);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (character) => {
    setSelectedCharacter(character);
    setEditForm({
      name: character.name,
      description: character.description,
      systemPrompt: character.systemPrompt,
      isPublic: character.isPublic,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(`/api/characters/${selectedCharacter._id}`, config);
      setCharacters(characters.filter((c) => c._id !== selectedCharacter._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Karakter silinirken bir hata oluştu.');
      console.error('Karakter silme hatası:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'isPublic' ? checked : value,
    });
  };

  const handleEditSubmit = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.put(
        `/api/characters/${selectedCharacter._id}`,
        editForm,
        config
      );

      setCharacters(
        characters.map((c) => (c._id === selectedCharacter._id ? res.data : c))
      );
      setEditDialogOpen(false);
    } catch (err) {
      setError('Karakter güncellenirken bir hata oluştu.');
      console.error('Karakter güncelleme hatası:', err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          mt: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Karakterlerim
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/create-character"
        >
          Yeni Karakter
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {characters.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz hiç karakteriniz yok.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/create-character"
            sx={{ mt: 2 }}
          >
            İlk Karakterinizi Oluşturun
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {characters.map((character) => (
            <Grid item xs={12} sm={6} md={4} key={character._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {character.name}
                    </Typography>
                    <Chip
                      label={character.isPublic ? 'Genel' : 'Özel'}
                      color={character.isPublic ? 'secondary' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {character.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ChatIcon />}
                    onClick={() => handleStartChat(character._id)}
                  >
                    Sohbet
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(character)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(character)}
                  >
                    Sil
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Karakteri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{selectedCharacter?.name}" karakterini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Düzenleme Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Karakteri Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Karakter Adı"
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Açıklama"
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            multiline
            rows={2}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Sistem Promptu"
            name="systemPrompt"
            value={editForm.systemPrompt}
            onChange={handleEditChange}
            multiline
            rows={4}
            helperText="Karakterin davranışını ve bilgisini tanımlayan sistem promptu."
          />
          <FormControlLabel
            control={
              <Switch
                checked={editForm.isPublic}
                onChange={handleEditChange}
                name="isPublic"
              />
            }
            label="Genel (Herkes görebilir)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCharacters; 