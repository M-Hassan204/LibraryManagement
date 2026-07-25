import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useBook } from '../hooks/useBooks';
import { BookStatus } from '@/types/book.types';

export default function BookDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const bookId = id ? parseInt(id, 10) : 0;
  const { data: book, isLoading, isError, error } = useBook(bookId, bookId > 0);

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case BookStatus.Available: return 'success';
      case BookStatus.Borrowed: return 'warning';
      case BookStatus.Reserved: return 'info';
      case BookStatus.Unavailable: return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: BookStatus) => {
    return BookStatus[status] || 'Unknown';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !book) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error loading book details: {error?.message || 'Book not found'}
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

      <Card sx={{ p: { xs: 2, sm: 4 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
              alt={book.title}
              sx={{
                width: '100%',
                maxWidth: 300,
                height: 'auto',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {book.title}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                by {book.author?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={getStatusLabel(book.status)}
                color={getStatusColor(book.status) as any}
                variant="filled"
              />
              <Chip label={book.category?.name} variant="outlined" />
              <Chip label={`Published: ${book.publishedYear}`} variant="outlined" />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
              {book.description || 'No description available for this book.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  ISBN
                </Typography>
                <Typography variant="body1">
                  {book.isbn}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Added to Library
                </Typography>
                <Typography variant="body1">
                  {new Date(book.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
