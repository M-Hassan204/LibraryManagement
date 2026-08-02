import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Card, Typography, Grid, Avatar, Chip, Button, 
  Divider, Tab, Tabs, CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Email as EmailIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useAdminUser } from '../hooks/useUsers';
import { ROUTES } from '@/constants/routes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MemberDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const { data: user, isLoading, isError, error } = useAdminUser(id || '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MEMBERS)} sx={{ mb: 2 }}>
          Back to Members
        </Button>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error?.message?.includes('403') 
              ? 'You are not authorized to view this member\'s details.' 
              : `Error loading member: ${error?.message}`}
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!user) return <Typography>Member not found</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MEMBERS)} sx={{ mb: 2 }}>
        Back to Members
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Avatar 
              src={user.profileImageUrl ? `${import.meta.env.VITE_API_URL}${user.profileImageUrl}` : undefined} 
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
            >
              {!user.profileImageUrl && getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{user.fullName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>@{user.username}</Typography>
            
            <Chip 
              label={user.isActive ? 'Active' : 'Inactive'} 
              color={user.isActive ? 'success' : 'default'} 
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2">Joined {new Date(user.registrationDate).toLocaleDateString()}</Typography>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="member details tabs">
                <Tab label="Borrowing History" />
                <Tab label="Active Borrowings" />
                <Tab label="Overdue Books" />
              </Tabs>
            </Box>
            
            <CustomTabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Borrowing history cannot be fetched due to authorization constraints.
                </Typography>
              </Box>
            </CustomTabPanel>
            
            <CustomTabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Active borrowings cannot be fetched due to authorization constraints.
                </Typography>
              </Box>
            </CustomTabPanel>
            
            <CustomTabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Overdue books cannot be fetched due to authorization constraints.
                </Typography>
              </Box>
            </CustomTabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
