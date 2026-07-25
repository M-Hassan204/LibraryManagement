import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export function DashboardHeader(): React.ReactElement {
  const { user } = useAuth();
  const theme = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
          Welcome back, {user?.firstName || 'Admin'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your library today.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {timeString}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateString}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
          }}
        >
          {getInitials(user?.fullName)}
        </Avatar>
      </Box>
    </Box>
  );
}
