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
  alpha,
} from '@mui/material';
import {
  AutoStories as BooksIcon,
  People as AuthorsIcon,
  Category as CategoriesIcon,
  Autorenew as BorrowingsIcon,
  Group as UsersIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { useBooks } from '../../books/hooks/useBooks';

export default function HomePage(): React.ReactElement {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data: latestBooks, isLoading: isBooksLoading } = useBooks({
    pageNumber: 1,
    pageSize: 4,
    sortBy: 'id',
    sortDescending: true,
  });

  const shortcuts = [
    { title: 'Books', icon: <BooksIcon fontSize="large" />, path: ROUTES.BOOKS, color: 'primary' },
    { title: 'Borrowings', icon: <BorrowingsIcon fontSize="large" />, path: ROUTES.BORROWINGS, color: 'info' },
    ...(isAdmin ? [
      { title: 'Authors', icon: <AuthorsIcon fontSize="large" />, path: ROUTES.AUTHORS, color: 'secondary' },
      { title: 'Categories', icon: <CategoriesIcon fontSize="large" />, path: ROUTES.CATEGORIES, color: 'warning' },
      { title: 'Users', icon: <UsersIcon fontSize="large" />, path: ROUTES.USERS, color: 'error' },
      { title: 'Admin Dashboard', icon: <DashboardIcon fontSize="large" />, path: ROUTES.DASHBOARD, color: 'success' },
    ] : [
      { title: 'My Borrowings', icon: <BorrowingsIcon fontSize="large" />, path: ROUTES.MY_BORROWINGS, color: 'info' },
    ])
  ];

  return (
    <Box sx={{ pb: 8, pt: 2, maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h3" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here is what's happening in your library today.
        </Typography>
      </Box>

      {/* Shortcuts */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quick Navigation
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {shortcuts.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.title}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                borderLeft: 6,
                borderColor: `${item.color}.main`,
              }}
            >
              <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%', p: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0 }}>
                  <Box
                    sx={{
                      backgroundColor: alpha((theme.palette as any)[item.color].main, 0.1),
                      color: `${item.color}.main`,
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Latest Books */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Latest Arrivals
        </Typography>
        <Button 
          endIcon={<ArrowForwardIcon />} 
          onClick={() => navigate(isAdmin ? ROUTES.ADMIN_BOOKS : ROUTES.BOOKS)}
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
                      src={book.coverImageUrl}
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
                      {book.author?.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
