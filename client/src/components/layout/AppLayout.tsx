import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * AppLayout - the single shared layout wrapper for all authenticated and unauthenticated users.
 * Contains: Navbar (top app bar) + main content area + Footer.
 */
export default function AppLayout(): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        }>
          <Outlet />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}
