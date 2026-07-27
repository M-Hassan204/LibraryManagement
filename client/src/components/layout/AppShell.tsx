import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import { useAuth } from '@/context/AuthContext';
import { APP_ROLES } from '@/constants/roles';

/**
 * AppShell - the authenticated layout wrapper for all roles.
 * Contains: Sidebar (left drawer, only for Admins/Librarians) + TopBar (app bar) + main content area.
 */
export default function AppShell(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;
  const showSidebar = isAdmin || isLibrarian;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {showSidebar && <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar handleDrawerToggle={showSidebar ? handleDrawerToggle : undefined} hideSidebarToggle={!showSidebar} />
        <PageHeader />
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 1, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
