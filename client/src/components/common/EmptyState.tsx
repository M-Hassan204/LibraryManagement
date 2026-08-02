import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon = <InboxIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderRadius: 2,
        minHeight: '300px'
      }}
    >
      <Box sx={{ mb: 2 }}>
        {icon}
      </Box>
        <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ borderRadius: '20px', px: 4 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
