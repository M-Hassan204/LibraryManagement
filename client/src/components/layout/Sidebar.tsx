import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AutoStories as BooksIcon,
  People as AuthorsIcon,
  Category as CategoriesIcon,
  Autorenew as BorrowingsIcon,
  Group as UsersIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

const drawerWidth = 260;

export default function Sidebar(): React.ReactElement {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    { title: 'Home', icon: <HomeIcon />, path: '/app/home' },
    ...(isAdmin ? [
      { title: 'Admin Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
    ] : []),
    { title: 'Books', icon: <BooksIcon />, path: isAdmin ? ROUTES.ADMIN_BOOKS : ROUTES.BOOKS },
    ...(isAdmin ? [
      { title: 'Authors', icon: <AuthorsIcon />, path: ROUTES.AUTHORS },
      { title: 'Categories', icon: <CategoriesIcon />, path: ROUTES.CATEGORIES },
      { title: 'Borrowings', icon: <BorrowingsIcon />, path: ROUTES.BORROWINGS },
      { title: 'Users', icon: <UsersIcon />, path: ROUTES.USERS },
    ] : [
      { title: 'My Borrowings', icon: <BorrowingsIcon />, path: ROUTES.MY_BORROWINGS },
    ]),
  ];

  const bottomItems = [
    { title: 'Profile', icon: <ProfileIcon />, path: ROUTES.PROFILE },
    { title: 'Settings', icon: <SettingsIcon />, path: '#' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <BooksIcon color="primary" fontSize="large" />
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          LMS Portal
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', flexGrow: 1, px: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isSelected = location.pathname.startsWith(item.path) && item.path !== '/app';
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.contrastText,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? 'inherit' : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    slotProps={{ primary: { sx: { fontWeight: isSelected ? 'bold' : 'normal' } } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                disabled={item.path === '#'}
                onClick={() => handleNavigation(item.path)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton
              onClick={logout}
              sx={{ 
                borderRadius: 2,
                color: theme.palette.error.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontWeight: 'bold' } } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
