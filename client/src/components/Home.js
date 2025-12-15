import React from 'react';
import { Container, Typography, Card, CardContent, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QrCodeIcon from '@mui/icons-material/QrCode';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 3, px: 1 }}>
      <Box textAlign="center" sx={{ mb: 3 }}>
        <RestaurantIcon sx={{ fontSize: 56, color: '#2d5016', mb: 1.5 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '28px', color: '#2d5016', mb: 0.5 }}>
          Restaurant Ordering System
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#999' }}>
          QR-based ordering solution for modern restaurants
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 16px rgba(255, 107, 53, 0.2)',
                borderColor: '#ff6b35'
              }
            }}
            onClick={() => navigate('/menu?table=1')}
          >
            <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
              <QrCodeIcon sx={{ fontSize: 44, color: '#ff6b35', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', mb: 0.5 }}>
                Customer Menu
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 1.2 }}>
                View menu and place orders (Demo with Table 1)
              </Typography>
              <Button variant="contained" fullWidth sx={{ bgcolor: '#ff6b35', color: 'white', fontSize: '12px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#e55a24' } }}>
                View Menu
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 16px rgba(45, 80, 22, 0.2)',
                borderColor: '#2d5016'
              }
            }}
            onClick={() => navigate('/dashboard')}
          >
            <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
              <DashboardIcon sx={{ fontSize: 44, color: '#2d5016', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', mb: 0.5 }}>
                Restaurant Dashboard
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 1.2 }}>
                Manage orders, menu items, and tables
              </Typography>
              <Button variant="contained" fullWidth sx={{ bgcolor: '#2d5016', color: 'white', fontSize: '12px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#1a3d0a' } }}>
                Open Dashboard
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
              <RestaurantIcon sx={{ fontSize: 44, color: '#1976d2', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', mb: 1 }}>
                Features
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.8 }}>
                • QR Code ordering
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.8 }}>
                • Real-time updates
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.8 }}>
                • Menu management
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#999' }}>
                • Order tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
