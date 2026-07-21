import { Box, Card, Typography } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Shared layout for all authentication pages (Login, Register, Verify).
 * Displays a centered card with the logo and title.
 */
export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps): ReactElement {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            mb: 3,
            p: 1.5,
            bgcolor: 'primary.main',
            borderRadius: 2,
            display: 'flex',
            color: 'primary.contrastText',
          }}
        >
          <LibraryBooksIcon fontSize="large" />
        </Box>

        <Typography variant="h3" component="h1" gutterBottom align="center">
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            {subtitle}
          </Typography>
        )}

        <Box sx={{ width: '100%' }}>{children}</Box>
      </Card>
    </Box>
  );
}
