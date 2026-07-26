import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Tooltip
} from '@mui/material';
import { useSettings, type ThemeMode } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function SettingsPage(): React.ReactElement {
  const { themeMode, setThemeMode } = useSettings();
  const { logout } = useAuth();
  
  // Basic token expiry check (just for display)
  const token = storageService.getAccessToken();
  let tokenStatus = 'Not Available';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = new Date(payload.exp * 1000);
      tokenStatus = `Expires: ${expiry.toLocaleString()}`;
    } catch {
      tokenStatus = 'Invalid Token';
    }
  }

  const handleThemeChange = (event: any) => {
    setThemeMode(event.target.value as ThemeMode);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Appearance & Interface */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <DarkModeIcon color="primary" />
                <Typography variant="h6">Appearance & Interface</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Theme Mode" 
                    secondary="Select your preferred application theme" 
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={themeMode}
                        onChange={handleThemeChange}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications (Unsupported) */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6">Notifications</Typography>
                <Tooltip title="Notification preferences are currently not supported by the backend API.">
                  <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive daily summaries and alerts" 
                  />
                  <ListItemSecondaryAction>
                    <Switch edge="end" checked={false} disabled />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Browser Notifications" 
                    secondary="Receive real-time push notifications" 
                  />
                  <ListItemSecondaryAction>
                    <Switch edge="end" checked={false} disabled />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Account & Security */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Account & Security</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Current Session Token" 
                    secondary={tokenStatus} 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Revoke All Sessions" 
                    secondary="Log out from all other devices. (Not supported by backend)" 
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" color="error" disabled>
                      Revoke
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText 
                    primary="Logout" 
                    secondary="Log out from your current session" 
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      color="error"
                      onClick={logout}
                      startIcon={<LogoutIcon />}
                    >
                      Logout
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
