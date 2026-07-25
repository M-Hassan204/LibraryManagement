import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon, isLoading }: StatCardProps): React.ReactElement {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ width: '100%' }}>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              flexShrink: 0,
              ml: 2,
            }}
          >
            {isLoading ? <Skeleton variant="circular" width={56} height={56} /> : icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
