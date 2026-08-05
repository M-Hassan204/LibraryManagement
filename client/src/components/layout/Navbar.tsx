import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';
import { getImageUrl } from '@/utils/imageUrl';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;
  const isMember = user?.roles?.includes(APP_ROLES.Member) && !isAdmin && !isLibrarian;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchorEl(null);

  const navigateTo = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
    handleUserMenuClose();
  };

  const handleLogout = () => {
    handleUserMenuClose();
    if (mobileOpen) setMobileOpen(false);
    logout();
  };

  // ─── Dynamic Navigation Links ────────────────────────────────────────────────

  // Base links for everyone
  const baseLinks: NavItem[] = [
    { name: 'Home', path: ROUTES.HOME, icon: <HomeIcon /> },
    { name: 'Books', path: ROUTES.BOOKS, icon: <AutoStoriesIcon /> },
  ];

  if (isAuthenticated) {
    baseLinks.push({ name: 'Favorites', path: ROUTES.FAVORITES, icon: <FavoriteIcon /> });
  }

  if (isMember) {
    baseLinks.push({ name: 'My Borrowings', path: ROUTES.MY_BORROWINGS, icon: <AutorenewIcon /> });
  }

  baseLinks.push(
    { name: 'About', path: ROUTES.ABOUT, icon: <InfoIcon /> },
    { name: 'Contact', path: ROUTES.CONTACT, icon: <ContactSupportIcon /> }
  );

  const dynamicLinks: NavItem[] = [...baseLinks];

  // ─── Dynamic User Menu Items ────────────────────────────────────────────────

  const renderUserMenuItems = () => {
    if (isAdmin) {
      return [
        <MenuItem key="dashboard" onClick={() => navigateTo(ROUTES.DASHBOARD)}>
          <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon> Dashboard
        </MenuItem>,
        <MenuItem key="profile" onClick={() => navigateTo(ROUTES.PROFILE)}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon> My Profile
        </MenuItem>,
        <MenuItem key="settings" onClick={() => navigateTo(ROUTES.SETTINGS)}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
        </MenuItem>,
        <MenuItem key="notifications" onClick={handleUserMenuClose}>
          <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon> Notifications
        </MenuItem>
      ];
    }
    
    if (isLibrarian) {
      return [
        <MenuItem key="dashboard" onClick={() => navigateTo(ROUTES.DASHBOARD)}>
          <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon> Dashboard
        </MenuItem>,
        <MenuItem key="profile" onClick={() => navigateTo(ROUTES.PROFILE)}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon> My Profile
        </MenuItem>,
        <MenuItem key="settings" onClick={() => navigateTo(ROUTES.SETTINGS)}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
        </MenuItem>
      ];
    }
    
    // Normal User
    return [
      <MenuItem key="profile" onClick={() => navigateTo(ROUTES.PROFILE)}>
        <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon> My Profile
      </MenuItem>,
      <MenuItem key="my-requests" onClick={() => navigateTo(ROUTES.MY_BORROWINGS)}>
        <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon> My Requests
      </MenuItem>,
      <MenuItem key="borrowing-history" onClick={() => navigateTo(ROUTES.MY_BORROWINGS)}>
        <ListItemIcon><AutoStoriesIcon fontSize="small" /></ListItemIcon> Borrowing History
      </MenuItem>,
      <MenuItem key="settings" onClick={() => navigateTo(ROUTES.SETTINGS)}>
        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
      </MenuItem>
    ];
  };

  const drawerContent = (
    <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 64 }} />
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Library System</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {dynamicLinks.map((page) => {
            const isSelected = location.pathname.startsWith(page.path) && (page.path !== ROUTES.HOME || location.pathname === ROUTES.HOME);
            return (
              <ListItem key={page.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => navigateTo(page.path)}
                  selected={isSelected}
                  sx={{ 
                    borderRadius: 2, 
                    mx: 1,
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
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={page.name} 
                    slotProps={{ primary: { sx: { fontWeight: isSelected ? 'bold' : 'normal' } } }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {!isAuthenticated && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={() => navigateTo(ROUTES.LOGIN)}>Login</Button>
          <Button variant="contained" fullWidth onClick={() => navigateTo(ROUTES.REGISTER)}>Register</Button>
        </Box>
      )}
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider', boxShadow: 'none' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}>
          
          {/* Mobile Hamburger */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleDrawerToggle}
              color="inherit"
              sx={{ ml: -1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: { xs: 56, lg: 72 }, mr: 1, display: { xs: 'none', lg: 'flex' } }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={ROUTES.HOME}
            sx={{
              mr: 4,
              display: { xs: 'none', lg: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '-0.5px'
            }}
          >
            Library System
          </Typography>

          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexGrow: 1, alignItems: 'center', justifyContent: 'center', ml: isAuthenticated ? 4 : 0 }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 56, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to={ROUTES.HOME}
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LMS
            </Typography>
          </Box>

          {/* Desktop Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
            {dynamicLinks.map((page) => {
               const isSelected = location.pathname.startsWith(page.path) && (page.path !== ROUTES.HOME || location.pathname === ROUTES.HOME);
               return (
                <Button
                  key={page.name}
                  onClick={() => navigateTo(page.path)}
                  sx={{
                    my: 2,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    display: 'block',
                    fontWeight: isSelected ? 700 : 500,
                    borderBottom: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    borderRadius: 0,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  {page.name}
                </Button>
               );
            })}
          </Box>

          {/* Right side (Auth/Guest actions) */}
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 2, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                  onClick={handleUserMenuOpen}
                >
                  <Avatar
                    src={user?.profileImageUrl ? getImageUrl(user.profileImageUrl) : undefined}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 'bold',
                    }}
                  >
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    {user?.lastName?.[0]?.toUpperCase() || ''}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {user?.fullName || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                      {user?.roles?.join(', ') || 'Role'}
                    </Typography>
                  </Box>
                </Box>
                
                <Menu
                  anchorEl={userMenuAnchorEl}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  slotProps={{ paper: { elevation: 3, sx: { width: 220, mt: 1, overflow: 'visible' } } }}
                >
                  <Box sx={{ px: 2, py: 1, display: { xs: 'block', md: 'none' } }}>
                    <Typography variant="subtitle2">{user?.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.roles?.join(', ')}</Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                  
                  {renderUserMenuItems()}
                  
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon> 
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button 
                  variant="outlined"
                  onClick={() => navigateTo(ROUTES.LOGIN)}
                  sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => navigateTo(ROUTES.REGISTER)}
                  sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}
