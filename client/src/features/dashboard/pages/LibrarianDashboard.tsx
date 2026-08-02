import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Alert,
  Box,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import UndoIcon from '@mui/icons-material/Undo';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

import { useDashboardStats } from '../hooks/useDashboardStats';
import { usePendingDeliveries } from '../hooks/useDeliveries';
import { useAllBorrowings } from '@/features/borrowings/hooks/useBorrowings';
import { useAdminUsers } from '@/features/users/hooks/useAdminUsers';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '../components/StatCard';
import { DeliveryStatus } from '@/types/delivery.types';

const formatDate = (dateString: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString));
};

const formatShortDate = (dateString: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

export function LibrarianDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
  const { data: deliveriesData, isLoading: isLoadingDeliveries } = usePendingDeliveries();
  const { data: borrowingsData, isLoading: isLoadingBorrowings } = useAllBorrowings({ pageSize: 50 });
  const { data: membersData, isLoading: isLoadingMembers } = useAdminUsers({ pageSize: 5 });

  const today = new Date();
  
  const pendingDeliveriesCount = deliveriesData?.length || 0;
  
  const allBorrowings = borrowingsData?.items || [];
  const recentBorrowings = allBorrowings.slice(0, 5);
  
  const booksDueToday = allBorrowings.filter(b => {
    if (!b.dueDate || b.returnedAt) return false;
    const dueDate = new Date(b.dueDate);
    return dueDate.getFullYear() === today.getFullYear() && 
           dueDate.getMonth() === today.getMonth() && 
           dueDate.getDate() === today.getDate();
  });

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`${ROUTES.ADMIN_BOOKS}?search=${encodeURIComponent(searchQuery)}`);
  };

  const quickActions = [
    { label: 'Borrow a Book', icon: <LibraryBooksIcon fontSize="large" />, path: ROUTES.ADMIN_BOOKS, color: '#1976d2' },
    { label: 'Return a Book', icon: <UndoIcon fontSize="large" />, path: ROUTES.BORROWINGS, color: '#2e7d32' },
    { label: 'Manage Borrowings', icon: <AutorenewIcon fontSize="large" />, path: ROUTES.BORROWINGS, color: '#ed6c02' },
    { label: 'Manage Deliveries', icon: <LocalShippingIcon fontSize="large" />, path: ROUTES.ADMIN_DELIVERIES, color: '#9c27b0' },
    { label: 'Search Members', icon: <PeopleIcon fontSize="large" />, path: ROUTES.MEMBERS, color: '#0288d1' },
    { label: 'Search Books', icon: <AutoStoriesIcon fontSize="large" />, path: ROUTES.ADMIN_BOOKS, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Welcome back, {user?.firstName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {formatDate(today)} — Here's what's happening today.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSearch} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search books or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ minWidth: { sm: 300 }, bgcolor: 'background.paper' }}
            />
          </Box>
        </Box>

        {(statsData?.overdueBooks || 0) > 0 && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            You have {statsData?.overdueBooks} overdue books that require attention.
          </Alert>
        )}
        {pendingDeliveriesCount > 0 && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
            There are {pendingDeliveriesCount} pending deliveries to process.
          </Alert>
        )}

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Card sx={{ height: '100%', bgcolor: 'background.paper', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardActionArea onClick={() => navigate(action.path)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                  <Box sx={{ color: action.color, mb: 1 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {action.label}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Today's Statistics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              title="Active Borrowings"
              value={statsData?.activeBorrowings}
              icon={<AutorenewIcon fontSize="large" />}
              isLoading={isLoadingStats}
              color="primary"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              title="Books Returned Today"
              value={statsData?.totalBooks} 
              icon={<CheckCircleIcon fontSize="large" />}
              isLoading={isLoadingStats}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              title="Pending Deliveries"
              value={pendingDeliveriesCount}
              icon={<LocalShippingIcon fontSize="large" />}
              isLoading={isLoadingDeliveries}
              color="warning"
              onClick={() => navigate(ROUTES.ADMIN_DELIVERIES)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              title="Available Books"
              value={statsData?.totalBooks ? statsData.totalBooks - (statsData.activeBorrowings || 0) : 0}
              icon={<LibraryBooksIcon fontSize="large" />}
              isLoading={isLoadingStats}
              color="info"
              onClick={() => navigate(ROUTES.ADMIN_BOOKS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              title="Overdue Books"
              value={statsData?.overdueBooks}
              icon={<WarningAmberIcon fontSize="large" />}
              isLoading={isLoadingStats}
              color="error"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Recent Borrowings
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Borrow Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingBorrowings ? (
                    <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
                  ) : recentBorrowings.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No recent borrowings found</TableCell></TableRow>
                  ) : (
                    recentBorrowings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.userName}</TableCell>
                        <TableCell>{b.bookTitle}</TableCell>
                        <TableCell>{formatShortDate(b.borrowedAt)}</TableCell>
                        <TableCell>{b.dueDate ? formatShortDate(b.dueDate) : '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={b.returnedAt ? 'Returned' : isOverdue(b.dueDate) ? 'Overdue' : 'Active'} 
                            color={b.returnedAt ? 'success' : isOverdue(b.dueDate) ? 'error' : 'primary'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Books Due Today
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingBorrowings ? (
                    <TableRow><TableCell colSpan={4} align="center">Loading...</TableCell></TableRow>
                  ) : booksDueToday.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center">No books due today</TableCell></TableRow>
                  ) : (
                    booksDueToday.map((b) => (
                      <TableRow key={b.id} sx={{ bgcolor: isOverdue(b.dueDate) ? 'error.main' : 'inherit' }}>
                        <TableCell>{b.userName}</TableCell>
                        <TableCell>{b.bookTitle}</TableCell>
                        <TableCell>{b.dueDate ? formatShortDate(b.dueDate) : '-'}</TableCell>
                        <TableCell>
                          <Button size="small" variant="contained" onClick={() => navigate(`/app/borrowings/${b.id}`)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Recent Deliveries
            </Typography>
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                {isLoadingDeliveries ? (
                  <Typography variant="body2">Loading...</Typography>
                ) : (deliveriesData?.length || 0) === 0 ? (
                  <Typography variant="body2" color="text.secondary">No pending deliveries.</Typography>
                ) : (
                  deliveriesData?.slice(0, 5).map(d => (
                    <Box key={d.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, borderBottom: 0 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {d.bookTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        To: {d.deliveryAddress}
                      </Typography>
                      <Chip label={DeliveryStatus[d.status] || 'Pending'} size="small" color="warning" sx={{ mt: 1 }} />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Recent Members
            </Typography>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                {isLoadingMembers ? (
                  <Typography variant="body2">Loading...</Typography>
                ) : (membersData?.items?.length || 0) === 0 ? (
                  <Typography variant="body2" color="text.secondary">No recent members.</Typography>
                ) : (
                  membersData?.items.map(m => (
                    <Box key={m.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {m.firstName} {m.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined recently
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
