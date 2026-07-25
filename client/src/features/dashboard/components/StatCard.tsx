import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export function StatCard({ title, value, icon, isLoading, color = 'primary' }: StatCardProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 28px 0 rgba(0,0,0,0.08)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          backgroundColor: `${color}.main`,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ width: '100%' }}>
          <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width="60%" height={48} />
          ) : (
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              backgroundColor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              flexShrink: 0,
              ml: 2,
            }}
          >
            {isLoading ? <Skeleton variant="circular" width={60} height={60} /> : icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
