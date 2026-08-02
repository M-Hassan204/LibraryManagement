import { Box, Container, Typography, Divider, Stack, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        pt: 6, 
        pb: 3, 
        borderTop: 1, 
        borderColor: 'divider',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <LocalLibraryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
              Library Management System
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <IconButton aria-label="github" color="inherit">
              <GitHubIcon />
            </IconButton>
            <IconButton aria-label="linkedin" color="inherit">
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ITI Graduation Project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 1, sm: 0 } }}>
            Developed by Mohammed Hassan
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
