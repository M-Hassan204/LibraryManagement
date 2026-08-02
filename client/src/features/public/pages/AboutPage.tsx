import { Box, Container, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LanguageIcon from '@mui/icons-material/Language';

export default function AboutPage() {
  const theme = useTheme();

  const technologies = [
    { title: 'React & Vite', icon: <LanguageIcon color="primary" />, desc: 'Modern frontend library with fast build tooling.' },
    { title: 'TypeScript', icon: <CodeIcon color="secondary" />, desc: 'Static typing for more robust and maintainable code.' },
    { title: 'ASP.NET Core Web API', icon: <CodeIcon color="info" />, desc: 'High-performance backend API framework.' },
    { title: 'Entity Framework Core', icon: <StorageIcon color="success" />, desc: 'Modern object-database mapper for .NET.' },
    { title: 'SQL Server', icon: <StorageIcon color="warning" />, desc: 'Reliable relational database management system.' },
    { title: 'Clean Architecture', icon: <ArchitectureIcon color="error" />, desc: 'Separation of concerns for scalable applications.' },
  ];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          About the Project
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
          A modern, full-stack Library Management System designed to handle books, authors, categories, and borrowing transactions efficiently.
        </Typography>

        <Card sx={{ mb: 6, p: 2, boxShadow: theme.palette.mode === 'dark' ? 1 : 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Purpose
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This project serves as a comprehensive system for managing library operations. It was developed to provide an intuitive interface for both library patrons (to browse and borrow books) and administrators (to manage the catalogue, users, and subscriptions). 
            </Typography>
            <Typography variant="body1">
              It is the culmination of the ITI Graduation Project, showcasing a strong understanding of modern full-stack development, API design, and clean architecture principles.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Technologies Used
        </Typography>
        
        <Grid container spacing={3}>
          {technologies.map((tech) => (
            <Grid size={{ xs: 12, sm: 6 }} key={tech.title}>
              <Card sx={{ height: '100%', display: 'flex', alignItems: 'flex-start', p: 2, boxShadow: theme.palette.mode === 'dark' ? 1 : 2 }}>
                <Box sx={{ mr: 2, mt: 1 }}>
                  {tech.icon}
                </Box>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {tech.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tech.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
