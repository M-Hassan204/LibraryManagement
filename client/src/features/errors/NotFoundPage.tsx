import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h1" color="text.primary" sx={{ mb: 1, letterSpacing: '-2px', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" color="text.primary" sx={{ mb: 3, fontWeight: 'bold' }}>
          Oops! Page Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate(ROUTES.HOME)}
            sx={{ borderRadius: 8, px: 4 }}
          >
            Go Home
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 8, px: 4 }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
