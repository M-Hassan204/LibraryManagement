import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import MenuIcon from '@mui/icons-material/Menu';
import { getImageUrl } from '@/utils/imageUrl';

interface TopBarProps {
  handleDrawerToggle?: () => void;
}

/**
 * TopBar provides the global top navigation for authenticated users.
 * Includes page title, breadcrumbs, notifications, and user profile menu.
 */
export default function TopBar({ handleDrawerToggle }: TopBarProps): React.ReactElement {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchorEl(null);

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleNavigateProfile = () => {
    handleUserMenuClose();
    navigate(ROUTES.PROFILE);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '48px !important', py: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {handleDrawerToggle && (
            <Box
              onClick={handleDrawerToggle}
              sx={{
                display: { sm: 'none' }, // Only show on mobile (xs)
                mr: 2,
                cursor: 'pointer',
                p: 1
              }}
            >
              <MenuIcon />
            </Box>
          )}
        </Box>

        {/* Right Side: User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

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
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
              }}
            >
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
              {user?.lastName?.[0]?.toUpperCase() || ''}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.fullName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.roles?.join(', ') || 'Role'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: { width: 200, mt: 1 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1, display: { xs: 'block', sm: 'none' } }}>
              <Typography variant="subtitle2">{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
            <MenuItem onClick={handleNavigateProfile}>Profile</MenuItem>
            <MenuItem onClick={() => { handleUserMenuClose(); navigate(ROUTES.SETTINGS); }}>Settings</MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
