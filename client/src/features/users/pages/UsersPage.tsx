import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  PersonOff as PersonOffIcon
} from '@mui/icons-material';

export default function UsersPage(): React.ReactElement {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Users Management
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <PersonOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            User Listing Unavailable
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            The backend API currently does not support listing, searching, or paginating users. 
            This feature has been gracefully disabled until the corresponding endpoints are implemented in the ASP.NET Core API.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
