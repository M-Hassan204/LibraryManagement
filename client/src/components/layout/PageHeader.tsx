import React from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

export default function PageHeader(): React.ReactElement {
  const location = useLocation();
  const theme = useTheme();

  const pathSegments = location.pathname
    .split('/')
    .filter((segment) => segment && segment !== 'app');

  const pageTitle =
    pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
      : 'Dashboard';

  const displayTitle = pageTitle === 'Home' ? 'Welcome' : pageTitle;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        pt: 2,
        pb: 1,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/app/home"
          sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}
        >
          Home
        </Link>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          if (segment === 'home') return null;
          const formattedSegment = segment
            .split('-')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');
          
          const to = `/app/${pathSegments.slice(0, index + 1).join('/')}`;

          return isLast ? (
            <Typography
              key={to}
              color="text.primary"
              sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              {formattedSegment}
            </Typography>
          ) : (
            <Link
              key={to}
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={to}
              sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}
            >
              {formattedSegment}
            </Link>
          );
        })}
      </Breadcrumbs>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        {displayTitle}
      </Typography>
    </Box>
  );
}
