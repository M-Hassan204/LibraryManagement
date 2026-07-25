import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function SystemStatusWidget(): React.ReactElement {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
          System Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">API Services</Typography>
            <Chip icon={<CheckCircleIcon />} label="Online" color="success" size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Database</Typography>
            <Chip icon={<CheckCircleIcon />} label="Online" color="success" size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">System Version</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>v1.0.0</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
