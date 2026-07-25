import React from 'react';
import { Box, Typography, Card, Alert, AlertTitle } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export default function UsersPage(): React.ReactElement {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Users Management
        </Typography>
      </Box>

      <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Alert severity="info" icon={<InfoIcon fontSize="inherit" />} sx={{ width: '100%', maxWidth: 600 }}>
          <AlertTitle>Feature Not Supported</AlertTitle>
          User Management is currently <strong>not supported</strong> by the backend API.
          <br /><br />
          The backend API does not currently expose endpoints to retrieve a list of users, view user details, or modify user statuses (such as activating or deactivating accounts) for administrators. 
          <br /><br />
          Once the backend endpoints are implemented, this page will be updated to include the User Management table and actions.
        </Alert>
      </Card>
    </Box>
  );
}
