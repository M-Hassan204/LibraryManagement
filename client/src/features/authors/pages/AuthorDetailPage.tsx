import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthor } from '../hooks/useAuthors';

export default function AuthorDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const authorId = id ? parseInt(id, 10) : 0;
  const { data: author, isLoading, isError, error } = useAuthor(authorId, authorId > 0);
  
  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Skeleton variant="text" width={120} height={40} sx={{ mb: 4 }} />
        <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
          <Divider sx={{ my: 3 }} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="80%" height={24} />
        </Card>
      </Box>
    );
  }

  if (isError || !author) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error loading author details: {error?.message || 'Author not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 4 }}
      >
        Back to List
      </Button>

      <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {author.name}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Biography
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2, lineHeight: 1.6 }}>
              {author.biography || 'No biography available for this author.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Additional Information
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">Added on</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(author.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              {author.updatedAt && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(author.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<EditIcon />}
                fullWidth
                onClick={() => navigate(`/app/authors/${author.id}/edit`)}
              >
                Edit Author
              </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
