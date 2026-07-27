import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';
import { useSubscription, useUpgradeSubscription, useCancelSubscription } from '../../public/hooks/useSubscriptions';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription.types';

import ProfileImageUploader from '../components/ProfileImageUploader';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage(): React.ReactElement {
  const { profile, isLoading, isError, updateProfile, changePassword } = useProfile();
  const { isAdmin } = useAuth();
  
  const { data: subscriptionResponse } = useSubscription(profile?.id);
  const upgradeMutation = useUpgradeSubscription();
  const cancelMutation = useCancelSubscription();
  
  const [tabValue, setTabValue] = useState(0);

  // Profile Edit State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    department: '',
    studentId: '',
  });
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Password State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        department: profile.department || '',
        studentId: profile.studentId || '',
      });
    }
  }, [profile]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (isError || !profile) {
    return <Alert severity="error">Failed to load profile information.</Alert>;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEditSuccess('');
    setEditError('');
    setPwdSuccess('');
    setPwdError('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      await updateProfile(editForm);
      setEditSuccess('Profile updated successfully.');
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(pwdForm);
      setPwdSuccess('Password changed successfully.');
      setPwdForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleUpgrade = async () => {
    await upgradeMutation.mutateAsync();
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync();
  };

  const sub = subscriptionResponse?.data;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Summary Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <ProfileImageUploader profile={profile} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {profile.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile.email}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                {profile.roles.map(role => (
                  <Chip 
                    key={role} 
                    label={role} 
                    color={role === APP_ROLES.Admin ? 'primary' : 'default'} 
                    size="small" 
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />

              {/* Unsupported info placeholders requested by user */}
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  User ID: {profile.id.substring(0, 8)}...
                </Typography>
                <Tooltip title="Not Supported by Backend">
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <InfoOutlinedIcon fontSize="inherit" /> Account Status: N/A
                  </Typography>
                </Tooltip>
                <Tooltip title="Not Supported by Backend">
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <InfoOutlinedIcon fontSize="inherit" /> Registration: N/A
                  </Typography>
                </Tooltip>
                <Tooltip title="Not Supported by Backend">
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <InfoOutlinedIcon fontSize="inherit" /> Last Login: N/A
                  </Typography>
                </Tooltip>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Tabs */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab icon={<PersonIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Edit Profile" />
                  <Tab icon={<SecurityIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Security" />
                  <Tab icon={<WorkspacePremiumIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Subscription" />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Tab 1: Edit Profile */}
                <TabPanel value={tabValue} index={0}>
                  {editSuccess && <Alert severity="success" sx={{ mb: 3 }}>{editSuccess}</Alert>}
                  {editError && <Alert severity="error" sx={{ mb: 3 }}>{editError}</Alert>}
                  
                  <Box component="form" onSubmit={handleProfileSubmit}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          required
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          value={profile.email}
                          disabled
                          helperText="Email address cannot be changed."
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Tooltip title="Not Supported by Backend">
                          <TextField
                            fullWidth
                            label="Username"
                            value="N/A"
                            disabled
                          />
                        </Tooltip>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Tooltip title="Not Supported by Backend">
                          <TextField
                            fullWidth
                            label="Phone Number"
                            value="N/A"
                            disabled
                          />
                        </Tooltip>
                      </Grid>

                      {/* Display extra fields if NOT admin or if they have values, just to be thorough */}
                      {(!isAdmin || profile.department || profile.studentId) && (
                        <>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              label="Department"
                              value={editForm.department}
                              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              label="Student ID"
                              value={editForm.studentId}
                              onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                            />
                          </Grid>
                        </>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button type="submit" variant="contained" color="primary">
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                {/* Tab 2: Security */}
                <TabPanel value={tabValue} index={1}>
                  {pwdSuccess && <Alert severity="success" sx={{ mb: 3 }}>{pwdSuccess}</Alert>}
                  {pwdError && <Alert severity="error" sx={{ mb: 3 }}>{pwdError}</Alert>}

                  <Box component="form" onSubmit={handlePasswordSubmit}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Current Password"
                          value={pwdForm.currentPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                          required
                        />
                      </Grid>
                      <Divider sx={{ width: '100%', my: 1 }} />
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="password"
                          label="New Password"
                          value={pwdForm.newPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Confirm New Password"
                          value={pwdForm.confirmNewPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, confirmNewPassword: e.target.value })}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button type="submit" variant="contained" color="primary">
                            Update Password
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                {/* Tab 3: Subscription */}
                <TabPanel value={tabValue} index={2}>
                  {sub ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>Current Plan: {SubscriptionPlan[sub.plan]}</Typography>
                      <Typography variant="body1">Status: {SubscriptionStatus[sub.status]}</Typography>
                      <Typography variant="body1">Valid until: {new Date(sub.endDate).toLocaleDateString()}</Typography>
                      
                      {sub.plan === SubscriptionPlan.Free && sub.status === SubscriptionStatus.Active && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          sx={{ mt: 3 }}
                          onClick={handleUpgrade}
                          disabled={upgradeMutation.isPending}
                        >
                          Upgrade to Premium
                        </Button>
                      )}
                      
                      {sub.status === SubscriptionStatus.Pending && (
                        <Alert severity="info" sx={{ mt: 3 }}>
                          Your Premium upgrade request is pending approval by an admin.
                        </Alert>
                      )}
                      
                      {sub.plan === SubscriptionPlan.Premium && sub.status === SubscriptionStatus.Active && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          sx={{ mt: 3 }}
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <CircularProgress />
                  )}
                </TabPanel>

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
