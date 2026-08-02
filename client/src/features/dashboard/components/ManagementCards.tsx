import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';

export function ManagementCards(): React.ReactElement {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;

  let managementItems: { label: string; icon: React.ReactNode; path: string; color: string }[] = [];

  if (isAdmin) {
    managementItems = [
      { label: 'Books', icon: <AutoStoriesIcon sx={{ fontSize: 40 }} />, path: ROUTES.ADMIN_BOOKS, color: 'primary.main' },
      { label: 'Authors', icon: <PeopleIcon sx={{ fontSize: 40 }} />, path: ROUTES.AUTHORS, color: 'secondary.main' },
      { label: 'Categories', icon: <CategoryIcon sx={{ fontSize: 40 }} />, path: ROUTES.CATEGORIES, color: 'info.main' },
      { label: 'Users', icon: <PeopleIcon sx={{ fontSize: 40 }} />, path: ROUTES.USERS, color: 'warning.main' },
      { label: 'Borrowings', icon: <AutorenewIcon sx={{ fontSize: 40 }} />, path: ROUTES.BORROWINGS, color: 'success.main' },
      { label: 'Deliveries', icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, path: ROUTES.ADMIN_DELIVERIES, color: 'error.main' },
    ];
  } else if (isLibrarian) {
    managementItems = [
      { label: 'Book Management', icon: <AutoStoriesIcon sx={{ fontSize: 40 }} />, path: ROUTES.ADMIN_BOOKS, color: 'primary.main' },
      { label: 'Members', icon: <PeopleIcon sx={{ fontSize: 40 }} />, path: ROUTES.USERS, color: 'warning.main' },
      { label: 'Borrowings', icon: <AutorenewIcon sx={{ fontSize: 40 }} />, path: ROUTES.BORROWINGS, color: 'success.main' },
      { label: 'Deliveries', icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, path: ROUTES.ADMIN_DELIVERIES, color: 'error.main' },
    ];
  }

  if (managementItems.length === 0) return <></>;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Management
      </Typography>
      <Grid container spacing={3}>
        {managementItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={item.label}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 2px 10px 0 rgba(0,0,0,0.02)' }}>
              <CardActionArea 
                onClick={() => navigate(item.path)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
              >
                <Box sx={{ color: item.color, mb: 2 }}>
                  {item.icon}
                </Box>
                <CardContent sx={{ p: 0, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {item.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
