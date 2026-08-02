import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  useTheme,
  Skeleton,
  Container,
} from '@mui/material';
import {
  AutoStories as BooksIcon,
  ArrowForward as ArrowForwardIcon,
  CardMembership as MembershipIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { useBooks } from '../../books/hooks/useBooks';
import { useMyBorrowings } from '@/features/borrowings/hooks/useBorrowings';
import { useMySubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import { getImageUrl } from '@/utils/imageUrl';
import { SubscriptionPlan } from '@/types/subscription.types';
import { StatCard } from '../components/StatCard';
import { APP_ROLES } from '@/constants/roles';

export default function HomePage(): React.ReactElement {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // A member is a normal user (not an admin or librarian)
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian);
  const isMember = user?.roles?.includes(APP_ROLES.Member) && !isAdmin && !isLibrarian;

  const { data: latestBooks, isLoading: isBooksLoading } = useBooks({
    pageNumber: 1,
    pageSize: 4,
    sortBy: 'createdAt',
    sortDescending: true,
  });

  const { data: borrowings, isLoading: borrowingsLoading } = useMyBorrowings();
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription();

  const activeBorrowings = borrowings?.filter(b => !b.returnedAt) || [];
  const overdueBorrowings = activeBorrowings.filter(b => new Date(b.dueDate) < new Date());

  const getPlanName = (plan?: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.None: return 'No Plan';
      case SubscriptionPlan.Free: return 'Free Plan';
      case SubscriptionPlan.Premium: return 'Premium Plan';
      default: return 'No Plan';
    }
  };

  const getPlanColor = (plan?: SubscriptionPlan): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (plan) {
      case SubscriptionPlan.Premium: return 'primary';
      case SubscriptionPlan.Free: return 'secondary';
      default: return 'info';
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
          py: { xs: 6, md: 8 },
          mb: 6,
          borderBottom: 1,
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
            {user ? `Welcome back, ${user.firstName}! 👋` : 'Welcome to the Library! 📚'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            Ready to discover your next great read? Browse our vast collection of books.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate(ROUTES.BOOKS)}
              sx={{ borderRadius: '24px', px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Browse Books
            </Button>
            {isMember && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="large" 
                onClick={() => navigate(ROUTES.MY_BORROWINGS)}
                sx={{ borderRadius: '24px', px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                My Borrowings
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }}>
        {/* Role Specific Widgets (Only for Members) */}
        {isMember && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Your Account Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  title="Current Plan"
                  value={getPlanName(subscription?.data?.plan)}
                  icon={<MembershipIcon fontSize="large" />}
                  isLoading={subscriptionLoading}
                  color={getPlanColor(subscription?.data?.plan)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  title="Active Borrowings"
                  value={activeBorrowings.length}
                  icon={<BooksIcon fontSize="large" />}
                  isLoading={borrowingsLoading}
                  color="info"
                  onClick={() => navigate(ROUTES.MY_BORROWINGS)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  title="Overdue Books"
                  value={overdueBorrowings.length}
                  icon={<WarningIcon fontSize="large" />}
                  isLoading={borrowingsLoading}
                  color={overdueBorrowings.length > 0 ? "error" : "success"}
                  onClick={() => navigate(ROUTES.MY_BORROWINGS)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Latest Books */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Latest Arrivals
          </Typography>
          <Button 
            endIcon={<ArrowForwardIcon />} 
            onClick={() => navigate(ROUTES.BOOKS)}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={4}>
          {isBooksLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : (
            latestBooks?.items.map((book) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={book.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate(`/books/${book.id}`)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    {book.coverImageUrl ? (
                      <Box
                         component="img"
                         src={getImageUrl(book.coverImageUrl)}
                         alt={book.title}
                         sx={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '2/3',
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'grey.500',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          No Cover
                        </Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {book.authorName || book.author?.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
