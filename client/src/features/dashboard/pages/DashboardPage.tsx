import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';
import { AdminDashboard } from './AdminDashboard';
import { LibrarianDashboard } from './LibrarianDashboard';
import { Box, CircularProgress } from '@mui/material';

export default function DashboardPage(): React.ReactElement {
  const { user, isAdmin, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;

  if (isLibrarian) {
    return <LibrarianDashboard />;
  }

  return <AdminDashboard />;
}
