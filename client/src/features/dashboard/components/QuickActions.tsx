import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { ROUTES } from '@/constants/routes';

const actions = [
  { label: 'Add Book', icon: <AutoStoriesIcon />, path: ROUTES.ADMIN_BOOK_CREATE, color: 'primary' },
  { label: 'Manage Books', icon: <LibraryBooksIcon />, path: ROUTES.ADMIN_BOOKS, color: 'primary' },
  { label: 'Add Author', icon: <PersonAddIcon />, path: ROUTES.AUTHOR_CREATE, color: 'secondary' },
  { label: 'Manage Authors', icon: <PeopleIcon />, path: ROUTES.AUTHORS, color: 'secondary' },
  { label: 'Manage Categories', icon: <CategoryIcon />, path: ROUTES.CATEGORIES, color: 'info' },
  { label: 'Manage Users', icon: <GroupIcon />, path: ROUTES.USERS, color: 'warning' },
  { label: 'Borrowings', icon: <ArrowUpwardIcon />, path: ROUTES.BORROWINGS, color: 'success' },
  { label: 'Deliveries', icon: <LocalShippingIcon />, path: ROUTES.ADMIN_DELIVERIES, color: 'error' },
];

export function QuickActions(): React.ReactElement {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={action.label}>
            <Button
              component={RouterLink}
              to={action.path}
              variant="outlined"
              color={action.color as any}
              fullWidth
              startIcon={action.icon}
              sx={{
                py: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                borderRadius: 3,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 10px 0 rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease-in-out',
                '& .MuiButton-startIcon': { margin: 0, mb: 0 },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px 0 rgba(0,0,0,0.08)',
                  backgroundColor: `${action.color}.50`,
                },
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
