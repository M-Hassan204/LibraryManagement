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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as BorrowIcon,
  KeyboardReturn as ReturnIcon,
  ImportContacts as ReadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useBook, useDeleteBook, useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/useBooks';
import { useBorrowBook, useMyBorrowings, useReturnBook } from '../../borrowings/hooks/useBorrowings';
import { useReadBook } from '../../public/hooks/useReading';
import { BookStatus } from '@/types/book.types';
import { BorrowingStatus } from '@/types/borrowing.types';
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
  const returnMutation = useReturnBook();
  const readMutation = useReadBook();
  
  const { data: favorites } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  const isFavorite = favorites?.some(f => f.id === bookId);
  
  const { data: myBorrowings } = useMyBorrowings();
  const hasPendingRequest = myBorrowings?.some(b => b.bookId === bookId && b.status === BorrowingStatus.Pending);
  const activeBorrowing = myBorrowings?.find(b => b.bookId === bookId && b.status === BorrowingStatus.Borrowed && !b.returnedAt);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowNotes, setBorrowNotes] = useState('');
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
      await borrowMutation.mutateAsync({ 
        bookId, 
        homeDelivery: false,
        latitude: 0,
        longitude: 0,
        notes: borrowNotes
      });
      setSnackbar({ open: true, message: 'Borrow request submitted successfully. Waiting for librarian approval.', severity: 'success' });
      setBorrowDialogOpen(false);
      setBorrowNotes('');
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to request book', severity: 'error' });
    }
  };

  const handleReadOnline = () => {
    navigate(`/app/books/${bookId}/read`);
  };

  const handleReturn = async () => {
    if (!activeBorrowing) return;
    try {
      await returnMutation.mutateAsync({ id: activeBorrowing.id, data: { notes: '' } });
      setSnackbar({ open: true, message: 'Book returned successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to return book', severity: 'error' });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync(bookId);
      } else {
        await addFavoriteMutation.mutateAsync(bookId);
      }
      setSnackbar({ open: true, message: isFavorite ? 'Removed from favorites' : 'Added to favorites', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update favorites', severity: 'error' });
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
                disabled={book.status !== BookStatus.Available || borrowMutation.isPending || hasPendingRequest}
                onClick={() => setBorrowDialogOpen(true)}
              >
                {borrowMutation.isPending ? 'Requesting...' : hasPendingRequest ? 'Pending Approval' : 'Borrow Book'}
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth
                startIcon={<ReadIcon />}
                disabled={readMutation.isPending}
                onClick={handleReadOnline}
              >
                {readMutation.isPending ? 'Loading...' : 'Read Online'}
              </Button>
              {activeBorrowing ? (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  startIcon={<ReturnIcon />}
                  disabled={returnMutation.isPending}
                  onClick={handleReturn}
                >
                  {returnMutation.isPending ? 'Returning...' : 'Return Book'}
                </Button>
              ) : (
                <Tooltip title="You have not borrowed this book.">
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
              )}
              <Button 
                variant={isFavorite ? "contained" : "outlined"} 
                color="secondary" 
                fullWidth
                startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                onClick={handleToggleFavorite}
                sx={{ mt: 1 }}
              >
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
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
                by {book.authorName || book.author?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Status: ${getStatusLabel(book.status)}`}
                color={getStatusColor(book.status) as any}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip label={book.categoryName || book.category?.name} variant="outlined" />
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

      <Dialog open={borrowDialogOpen} onClose={() => setBorrowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Borrow Book</DialogTitle>
        <DialogContent dividers>
          {book && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                 {book.coverImageUrl ? (
                    <Box
                      component="img"
                      src={getImageUrl(book.coverImageUrl)}
                      alt={book.title}
                      sx={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 1, boxShadow: 1 }}
                    />
                  ) : (
                    <Box sx={{ width: 80, height: 120, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">No Cover</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{book.title}</Typography>
                    <Typography variant="body2" color="text.secondary">by {book.authorName || book.author?.name}</Typography>
                    <Chip
                      label={getStatusLabel(book.status)}
                      color={getStatusColor(book.status) as any}
                      size="small"
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Box>
              </Box>

              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Library Policy</Typography>
                <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2, color: 'text.secondary' }}>
                  <li>Maximum borrowing period is determined by the librarian.</li>
                  <li>Pickup date will be assigned after approval.</li>
                  <li>Return date will be assigned after approval.</li>
                </Typography>
              </Box>

              <TextField
                label="Additional Notes (optional)"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={borrowNotes}
                onChange={(e) => setBorrowNotes(e.target.value)}
                placeholder="E.g., I would like to pick this up on Friday morning if possible."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBorrowDialogOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleBorrow} 
            variant="contained" 
            disabled={borrowMutation.isPending}
          >
            {borrowMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

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
