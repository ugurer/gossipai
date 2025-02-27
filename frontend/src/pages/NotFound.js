import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 5,
          mt: 5,
          mb: 5,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Sayfa Bulunamadı
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            size="large"
          >
            Ana Sayfaya Dön
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 