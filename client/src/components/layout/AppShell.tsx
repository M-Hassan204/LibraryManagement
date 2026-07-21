import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * AppShell — the authenticated layout wrapper.
 * Will contain: Sidebar (left drawer) + TopBar (app bar) + main content area.
 * Full implementation in Phase 5.
 */
export default function AppShell(): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar will be inserted here in Phase 5 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* TopBar will be inserted here in Phase 5 */}
        <Outlet />
      </Box>
    </Box>
  );
}
