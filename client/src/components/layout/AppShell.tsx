import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

/**
 * AppShell — the authenticated layout wrapper.
 * Will contain: Sidebar (left drawer) + TopBar (app bar) + main content area.
 */
export default function AppShell(): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <PageHeader />
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 1, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
