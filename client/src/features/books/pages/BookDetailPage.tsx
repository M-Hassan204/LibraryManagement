import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  Tooltip,
  Skeleton,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as BorrowIcon,
  KeyboardReturn as ReturnIcon,
} from '@mui/icons-material';
import { useBook, useDeleteBook } from '../hooks/useBooks';
import { useBorrowBook } from '../../borrowings/hooks/useBorrowings';
import { BookStatus } from '@/types/book.types';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { getImageUrl } from '@/utils/imageUrl';

export default function BookDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const bookId = id ? parseInt(id, 10) : 0;
  const { data: book, isLoading, isError, error } = useBook(bookId, bookId > 0);
  
  const deleteMutation = useDeleteBook();
  const borrowMutation = useBorrowBook();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(bookId);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Book deleted successfully', severity: 'success' });
      setTimeout(() => navigate(ROUTES.ADMIN_BOOKS), 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete book', severity: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  const handleBorrow = async () => {
    try {
      await borrowMutation.mutateAsync({ bookId });
      setSnackbar({ open: true, message: 'Book borrowed successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to borrow book', severity: 'error' });
    }
  };

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
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Skeleton variant="text" width={120} height={40} sx={{ mb: 4 }} />
        <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ maxWidth: 300, borderRadius: 2, alignSelf: 'center' }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ maxWidth: 300, alignSelf: 'center', mt: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ maxWidth: 300, alignSelf: 'center', mt: 1 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="text" width="80%" height={60} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Skeleton variant="rounded" width={80} height={32} />
                <Skeleton variant="rounded" width={100} height={32} />
                <Skeleton variant="rounded" width={120} height={32} />
              </Box>
              <Divider sx={{ my: 3 }} />
              <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="80%" height={24} />
            </Grid>
          </Grid>
        </Card>
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

      <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            {book.coverImageUrl ? (
              <Box
                component="img"
                src={getImageUrl(book.coverImageUrl)}
                alt={book.title}
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 'auto',
                  aspectRatio: '2/3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 3,
                  alignSelf: 'center',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  aspectRatio: '2/3',
                  borderRadius: 2,
                  boxShadow: 3,
                  alignSelf: 'center',
                  backgroundColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'grey.500',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  No Cover Available
                </Typography>
              </Box>
            )}
            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, maxWidth: 300, alignSelf: 'center', width: '100%' }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                startIcon={<BorrowIcon />}
                disabled={book.status !== BookStatus.Available || borrowMutation.isPending}
                onClick={handleBorrow}
              >
                {borrowMutation.isPending ? 'Borrowing...' : 'Borrow Book'}
              </Button>
              <Tooltip title="To return a book, please go to My Borrowings">
                <span>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    startIcon={<ReturnIcon />}
                    disabled
                  >
                    Return Book
                  </Button>
                </span>
              </Tooltip>
              {isAdmin && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={() => navigate(`/app/books/${book.id}/edit`)}
                  >
                    Edit Book
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    fullWidth
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Book
                  </Button>
                </>
              )}
            </Box>
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
                label={`Status: ${getStatusLabel(book.status)}`}
                color={getStatusColor(book.status) as any}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip label={book.category?.name} variant="outlined" />
              <Chip label={`Published: ${book.publishedYear}`} variant="outlined" />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2, lineHeight: 1.6 }}>
              {book.description || 'No description available for this book.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Additional Information
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">ISBN</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{book.isbn}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">Added to Library</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(book.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Book"
        content="Are you sure you want to delete this book? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
