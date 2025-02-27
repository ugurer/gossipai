import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Avatar,
  Rating,
  Skeleton,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  IconButton,
  Slide,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowForward as ArrowForwardIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { CharacterContext } from '../context/CharacterContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { getPopularCharacters, getCharacters } = useContext(CharacterContext);
  const [popularCharacters, setPopularCharacters] = useState([]);
  const [recentCharacters, setRecentCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const popularData = await getPopularCharacters(6);
        setPopularCharacters(popularData);
        
        const allCharacters = await getCharacters();
        // En son eklenen 6 karakteri al
        const recent = [...allCharacters].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 6);
        setRecentCharacters(recent);
        
        setLoading(false);
      } catch (error) {
        console.error('Karakter verileri alınırken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getPopularCharacters, getCharacters]);

  const handleStartChat = (characterId) => {
    navigate(`/chat/${characterId}`);
  };

  const heroSection = (
    <Box
      sx={{
        position: 'relative',
        height: isMobile ? '60vh' : '70vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        borderRadius: { xs: '0 0 24px 24px', md: '0 0 48px 48px' },
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        mb: 6,
      }}
    >
      {/* Dekoratif arka plan desenleri */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'url(/images/pattern.svg)',
          backgroundSize: 'cover',
        }}
      />
      
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Slide direction="right" in={true} timeout={1000}>
              <Box>
                <Typography
                  variant="h2"
                  color="white"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  Sohbet Asistanınız Yanınızda
                </Typography>
                <Typography
                  variant="h5"
                  color="white"
                  sx={{
                    mb: 4,
                    fontWeight: 400,
                    opacity: 0.9,
                    textShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  Yapay zeka destekli sohbet asistanımız ile sorularınıza anında cevap alın.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/characters')}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: '50px',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Hemen Başla
                  </Button>
                  {!user && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: '50px',
                        fontWeight: 600,
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Ücretsiz Kaydol
                    </Button>
                  )}
                </Box>
              </Box>
            </Slide>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Slide direction="left" in={true} timeout={1000}>
              <Box
                component="img"
                src="/images/mascot.webp"
                alt="GossipAI Hero"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                }}
              />
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  const featuresSection = (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Özelliklerimiz
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          GossipAI ile sorularınıza anında cevap alın, eğlenceli sohbetler edin ve günlük hayatınızı kolaylaştırın.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {[
          {
            title: 'Kişisel Sohbet Asistanı',
            description: 'Sorularınıza anında cevap alın, günlük konuşmalardan keyif alın.',
            icon: '💬',
          },
          {
            title: 'İçerik Önerileri',
            description: 'İlgi alanlarınıza göre içerik ve bilgi önerileri alın.',
            icon: '📱',
          },
          {
            title: 'Çoklu Dil Desteği',
            description: 'Türkçe dahil birçok dilde sohbet desteği alın.',
            icon: '🌐',
          },
          {
            title: 'Kişiselleştirilmiş Deneyim',
            description: 'Tercihlerinize göre özelleştirilmiş sohbet asistanlık hizmeti.',
            icon: '👤',
          },
          {
            title: 'Güvenli ve Gizli',
            description: 'Verileriniz güvenle saklanır, gizliliğiniz korunur.',
            icon: '🔒',
          },
          {
            title: 'Sürekli Güncel',
            description: 'Sürekli güncellenen bilgi tabanı ile güncel kalın.',
            icon: '🔄',
          },
        ].map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                transition: 'all 0.3s ease',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>
                {feature.icon}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  const popularCharactersSection = (
    <Box
      sx={{
        py: 8,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, rgba(18,18,18,0) 0%, rgba(18,18,18,0.8) 100%)' 
          : 'linear-gradient(180deg, rgba(245,245,247,0) 0%, rgba(245,245,247,0.8) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Popüler Sohbet Asistanları
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/characters')}
            sx={{ fontWeight: 600 }}
          >
            Tümünü Gör
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} width="80%" />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={100} />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" height={36} width={100} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {popularCharacters && Array.isArray(popularCharacters) ? popularCharacters.map((character, index) => (
              <Grid item xs={12} sm={6} md={4} key={character._id || `character-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {character.isPremium && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Premium"
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 10,
                        zIndex: 1,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="200"
                    image={character.imageUrl || '/images/default-character.png'}
                    alt={character.name}
                    sx={{
                      objectFit: 'cover',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {character.name}
                      </Typography>
                      <Rating
                        value={character.rating || 4.5}
                        precision={0.5}
                        size="small"
                        readOnly
                        icon={<StarIcon fontSize="inherit" />}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {character.title || 'Sohbet Asistanı'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                        height: '4.5em',
                      }}
                    >
                      {character.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {character.tags && Array.isArray(character.tags) && character.tags.slice(0, 3).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {character.tags && Array.isArray(character.tags) && character.tags.length > 3 && (
                        <Chip
                          label={`+${character.tags.length - 3}`}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ChatIcon />}
                      onClick={() => handleStartChat(character._id)}
                      sx={{ borderRadius: '50px' }}
                    >
                      Sohbet Başlat
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  Henüz karakter bulunmuyor.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );

  const testimonialSection = (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
          Kullanıcılarımız Ne Diyor?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          GossipAI'ın kullanıcılarımızın hayatlarını nasıl kolaylaştırdığını keşfedin.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {[
          {
            name: 'Ahmet Yılmaz',
            role: 'Öğrenci',
            comment: 'GossipAI, günlük sorularımda bana çok yardımcı oluyor. Artık bilgi aramak için saatlerimi harcamıyorum.',
            avatar: '/images/testimonial1.jpg',
            rating: 5,
          },
          {
            name: 'Ayşe Kaya',
            role: 'Sosyal Medya Uzmanı',
            comment: 'İçerik üretirken zorlandığımda GossipAI\'a danışıyorum. Çok yaratıcı ve eğlenceli fikirler veriyor.',
            avatar: '/images/testimonial2.jpg',
            rating: 4.5,
          },
          {
            name: 'Mehmet Demir',
            role: 'İş İnsanı',
            comment: 'Günlük sorularımı hızlıca yanıtlıyor. Hem bilgilendirici hem de eğlenceli bir asistan.',
            avatar: '/images/testimonial3.jpg',
            rating: 5,
          },
        ].map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </Box>
              </Box>
              <Rating
                value={testimonial.rating}
                precision={0.5}
                readOnly
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ flex: 1 }}>
                "{testimonial.comment}"
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  const ctaSection = (
    <Box
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderRadius: { xs: '24px 24px 0 0', md: '48px 48px 0 0' },
        mt: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            color="white"
            sx={{
              fontWeight: 700,
              mb: 3,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Sohbet Etmek İçin Hemen Başlayın
          </Typography>
          <Typography
            variant="h6"
            color="white"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: '700px',
              mx: 'auto',
              textShadow: '0 1px 5px rgba(0,0,0,0.1)',
            }}
          >
            Sorularınıza anında cevap alın, eğlenceli sohbetler edin ve günlük hayatınızı kolaylaştırın.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/characters')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Hemen Başla
          </Button>
        </Box>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ pb: 0 }}>
      {heroSection}
      {featuresSection}
      {popularCharactersSection}
      {testimonialSection}
      {ctaSection}
    </Box>
  );
};

export default Home; 