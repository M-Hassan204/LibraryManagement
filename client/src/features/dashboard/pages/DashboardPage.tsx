import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GroupIcon from '@mui/icons-material/Group';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/StatCard';
import { TopBorrowedBooksTable } from '../components/TopBorrowedBooksTable';

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, isError, error, refetch } = useDashboardStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Dashboard
      </Typography>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error?.message || 'Failed to load dashboard statistics.'}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Books"
            value={data?.totalBooks}
            icon={<AutoStoriesIcon />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={data?.totalUsers}
            icon={<GroupIcon />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Borrowings"
            value={data?.activeBorrowings}
            icon={<AutorenewIcon />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overdue Books"
            value={data?.overdueBooks}
            icon={<WarningAmberIcon />}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
        Top Borrowed Books
      </Typography>
      
      {!isLoading && !isError && !data ? (
         <Alert severity="info" sx={{ mt: 2 }}>No data available.</Alert>
      ) : (
         <TopBorrowedBooksTable books={data?.topBorrowedBooks} isLoading={isLoading} />
      )}
    </Container>
  );
}
