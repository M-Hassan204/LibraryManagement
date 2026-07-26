import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Alert,
  Button,
  Box
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GroupIcon from '@mui/icons-material/Group';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/StatCard';
import { TopBorrowedBooksTable } from '../components/TopBorrowedBooksTable';
import { QuickActions } from '../components/QuickActions';
import { SystemStatusWidget } from '../components/SystemStatusWidget';
import { EmptyChartsWidget } from '../components/EmptyChartsWidget';
import { ROUTES } from '@/constants/routes';

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, isError, error, refetch } = useDashboardStats();
  const navigate = useNavigate();

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 4, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            {error?.message || 'Failed to load dashboard statistics.'}
          </Alert>
        )}

        <QuickActions />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Books"
              value={data?.totalBooks}
              icon={<AutoStoriesIcon fontSize="large" />}
              isLoading={isLoading}
              color="primary"
              onClick={() => navigate(ROUTES.ADMIN_BOOKS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Users"
              value={data?.totalUsers}
              icon={<GroupIcon fontSize="large" />}
              isLoading={isLoading}
              color="secondary"
              onClick={() => navigate(ROUTES.USERS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Borrowings"
              value={data?.activeBorrowings}
              icon={<AutorenewIcon fontSize="large" />}
              isLoading={isLoading}
              color="info"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Overdue Books"
              value={data?.overdueBooks}
              icon={<WarningAmberIcon fontSize="large" />}
              isLoading={isLoading}
              color="error"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>
        </Grid>

        <EmptyChartsWidget />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Top Borrowed Books
            </Typography>
            
            {!isLoading && !isError && !data ? (
               <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>No data available.</Alert>
            ) : (
               <TopBorrowedBooksTable books={data?.topBorrowedBooks} isLoading={isLoading} />
            )}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ mt: { xs: 0, lg: '40px' }, height: 'calc(100% - 40px)' }}>
              <SystemStatusWidget />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
