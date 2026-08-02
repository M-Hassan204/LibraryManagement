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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuthors } from '@/features/authors/hooks/useAuthors';
import { useCategories } from '@/features/categories/hooks/useCategories';

import { StatCard } from '../components/StatCard';
import { TopBorrowedBooksTable } from '../components/TopBorrowedBooksTable';
import { QuickActions } from '../components/QuickActions';
import { ManagementCards } from '../components/ManagementCards';
import { SystemStatusWidget } from '../components/SystemStatusWidget';
import { EmptyChartsWidget } from '../components/EmptyChartsWidget';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, isError, error, refetch } = useDashboardStats();
  const { data: authorsData, isLoading: isLoadingAuthors } = useAuthors();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;

  const totalAuthors = authorsData?.length || 0;
  const totalCategories = categoriesData?.length || 0;

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          {isLibrarian ? 'Librarian Dashboard' : 'Admin Dashboard'}
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

        {/* Quick Actions (Admin only) */}
        {!isLibrarian && <QuickActions />}

        {/* Statistics Section */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Statistics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {!isLibrarian && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <StatCard
                  title="Total Books"
                  value={data?.totalBooks}
                  icon={<AutoStoriesIcon fontSize="large" />}
                  isLoading={isLoading}
                  color="primary"
                  onClick={() => navigate(ROUTES.ADMIN_BOOKS)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <StatCard
                  title="Total Authors"
                  value={totalAuthors}
                  icon={<PersonIcon fontSize="large" />}
                  isLoading={isLoadingAuthors}
                  color="secondary"
                  onClick={() => navigate(ROUTES.AUTHORS)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <StatCard
                  title="Total Categories"
                  value={totalCategories}
                  icon={<CategoryIcon fontSize="large" />}
                  isLoading={isLoadingCategories}
                  color="info"
                  onClick={() => navigate(ROUTES.CATEGORIES)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <StatCard
                  title="Total Users"
                  value={data?.totalUsers}
                  icon={<GroupIcon fontSize="large" />}
                  isLoading={isLoading}
                  color="warning"
                  onClick={() => navigate(ROUTES.USERS)}
                />
              </Grid>
            </>
          )}

          {isLibrarian && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Members"
                value={data?.totalUsers}
                icon={<GroupIcon fontSize="large" />}
                isLoading={isLoading}
                color="secondary"
                onClick={() => navigate(ROUTES.USERS)}
              />
            </Grid>
          )}
          
          <Grid size={{ xs: 12, sm: 6, md: isLibrarian ? 3 : 2 }}>
            <StatCard
              title="Active Borrowings"
              value={data?.activeBorrowings}
              icon={<AutorenewIcon fontSize="large" />}
              isLoading={isLoading}
              color="success"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: isLibrarian ? 3 : 2 }}>
            <StatCard
              title="Overdue Books"
              value={data?.overdueBooks}
              icon={<WarningAmberIcon fontSize="large" />}
              isLoading={isLoading}
              color="error"
              onClick={() => navigate(ROUTES.BORROWINGS)}
            />
          </Grid>

          {isLibrarian && (
             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Deliveries"
                  value={0} // Mock value for pending deliveries
                  icon={<LocalShippingIcon fontSize="large" />}
                  isLoading={isLoading}
                  color="warning"
                  onClick={() => navigate(ROUTES.ADMIN_DELIVERIES)}
                />
             </Grid>
          )}
        </Grid>

        {/* Management Cards (Both Admin and Librarian) */}
        <ManagementCards />

        {/* Analytics Section */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Analytics
        </Typography>

        {!isLibrarian && <EmptyChartsWidget />}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: isLibrarian ? 12 : 8 }}>
            {!isLoading && !isError && !data ? (
               <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>No data available.</Alert>
            ) : (
               <TopBorrowedBooksTable books={data?.topBorrowedBooks} isLoading={isLoading} />
            )}
          </Grid>
          {!isLibrarian && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ mt: { xs: 0, lg: '0' }, height: 'calc(100%)' }}>
                <SystemStatusWidget />
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
