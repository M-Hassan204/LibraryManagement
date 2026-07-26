import React from 'react';
import {
  Box,
  Drawer,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Divider,
  useMediaQuery,
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

const DRAWER_WIDTH_EXPANDED = 260;
const DRAWER_WIDTH_COMPACT = 80;

interface SidebarProps {
  mobileOpen?: boolean;
  handleDrawerToggle?: () => void;
}

export default function Sidebar({ mobileOpen = false, handleDrawerToggle }: SidebarProps): React.ReactElement {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  
  // Responsive breakpoints
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 768px

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && handleDrawerToggle) {
      handleDrawerToggle();
    }
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
    { title: 'Settings', icon: <SettingsIcon />, path: ROUTES.SETTINGS },
  ];

  // Drawer Content (reused across variants)
  const drawerContent = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
        <BooksIcon color="primary" fontSize="large" sx={{ minWidth: 35 }} />
        <Typography 
          className="sidebar-text"
          variant="h6" 
          color="primary" 
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', opacity: 1, transition: 'opacity 0.2s' }}
        >
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
                    justifyContent: 'center',
                    px: 2.5,
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
                  <ListItemIcon sx={{ color: isSelected ? 'inherit' : 'text.secondary', minWidth: 40, justifyContent: 'center' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    className="sidebar-text"
                    primary={item.title} 
                    slotProps={{ primary: { sx: { fontWeight: isSelected ? 'bold' : 'normal', whiteSpace: 'nowrap' } } }}
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
          {bottomItems.map((item) => {
            const isSelected = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    borderRadius: 2,
                    justifyContent: 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                  <ListItemText className="sidebar-text" primary={item.title} slotProps={{ primary: { sx: { whiteSpace: 'nowrap' } } }} />
                </ListItemButton>
              </ListItem>
            );
          })}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                logout();
                if (isMobile && handleDrawerToggle) handleDrawerToggle();
              }}
              sx={{ 
                borderRadius: 2,
                justifyContent: 'center',
                px: 2.5,
                color: theme.palette.error.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center' }}><LogoutIcon /></ListItemIcon>
              <ListItemText className="sidebar-text" primary="Logout" slotProps={{ primary: { sx: { fontWeight: 'bold', whiteSpace: 'nowrap' } } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle!}
        onOpen={handleDrawerToggle!}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH_EXPANDED },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  // Tablet or Desktop
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isDesktop ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COMPACT,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...( !isDesktop && {
          '&:hover': {
            width: DRAWER_WIDTH_EXPANDED,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH_EXPANDED,
            },
            '& .sidebar-text': {
              opacity: 1,
              width: 'auto',
              display: 'block'
            }
          },
        }),
        '& .MuiDrawer-paper': {
          width: isDesktop ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COMPACT,
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          // Tablet text hiding logic
          ...(!isDesktop && {
            '& .sidebar-text': {
              opacity: 0,
              display: 'none',
              transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }
          })
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
