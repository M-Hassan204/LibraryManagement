import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Skeleton, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMyBorrowings } from '@/features/borrowings/hooks/useBorrowings';
import { useMySubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import { ROUTES } from '@/constants/routes';
import { Book as BookIcon, CardMembership as MembershipIcon, History as HistoryIcon, Search as SearchIcon } from '@mui/icons-material';
import { SubscriptionPlan } from '@/types/subscription.types';

export default function MemberHomePage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: borrowings, isLoading: borrowingsLoading } = useMyBorrowings();
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription();

  const activeBorrowings = borrowings?.filter(b => !b.returnedAt) || [];
  const overdueBorrowings = activeBorrowings.filter(b => new Date(b.dueDate) < new Date());

  const getPlanColor = (plan?: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.Premium: return 'primary';
      case SubscriptionPlan.Free: return 'secondary';
      case SubscriptionPlan.None: return 'default';
      default: return 'default';
    }
  };

  const getPlanName = (plan?: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.None: return 'No Plan';
      case SubscriptionPlan.Free: return 'Free Plan';
      case SubscriptionPlan.Premium: return 'Premium Plan';
      default: return 'Loading...';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your account today.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Subscription Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MembershipIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Current Plan</Typography>
              </Box>
              {subscriptionLoading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <Box>
                  <Chip 
                    label={getPlanName(subscription?.data?.plan)} 
                    color={getPlanColor(subscription?.data?.plan) as any} 
                    sx={{ mb: 1, fontWeight: 'bold' }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    {subscription?.data?.plan === SubscriptionPlan.Premium 
                      ? 'You have unlimited access to premium books and online reading.' 
                      : subscription?.data?.plan === SubscriptionPlan.Free
                        ? 'Upgrade to Premium for full access.'
                        : 'You do not have an active subscription plan.'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Borrowings Stats Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BookIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Borrowings</Typography>
              </Box>
              {borrowingsLoading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {activeBorrowings.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books currently in your possession
                  </Typography>
                  {overdueBorrowings.length > 0 && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {overdueBorrowings.length} book(s) overdue!
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<SearchIcon />}
                onClick={() => navigate(ROUTES.BOOKS)}
                sx={{ mb: 1.5 }}
              >
                Browse Catalogue
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<HistoryIcon />}
                onClick={() => navigate(ROUTES.MY_BORROWINGS)}
              >
                View Borrowing History
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
