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
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  MenuBook as BookIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useBorrowing, useReturnBook } from '../hooks/useBorrowings';
import { BorrowingStatus } from '@/types/borrowing.types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function BorrowingDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const borrowingId = id ? parseInt(id, 10) : 0;
  const { data: borrowing, isLoading, isError, error } = useBorrowing(borrowingId, borrowingId > 0);
  const returnMutation = useReturnBook();
  
  const [returnDialogOpen, setReturnDialogOpen] = React.useState(false);

  const getStatusColor = (status: BorrowingStatus) => {
    switch (status) {
      case BorrowingStatus.Pending: return 'warning';
      case BorrowingStatus.Approved: return 'info';
      case BorrowingStatus.Borrowed: return 'primary';
      case BorrowingStatus.Returned: return 'success';
      case BorrowingStatus.Overdue: return 'error';
      case BorrowingStatus.Lost: return 'error';
      case BorrowingStatus.Rejected: return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: BorrowingStatus) => {
    return BorrowingStatus[status] || 'Unknown';
  };

  const handleReturn = async () => {
    if (borrowingId > 0) {
      await returnMutation.mutateAsync({ id: borrowingId, data: { notes: 'Returned from details page' } });
      setReturnDialogOpen(false);
    }
  };

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

  if (isError || !borrowing) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error loading borrowing details: {error?.message || 'Borrowing not found'}
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
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                Borrowing #{borrowing.id}
              </Typography>
              <Chip
                label={getStatusLabel(borrowing.status)}
                color={getStatusColor(borrowing.status) as any}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Borrowing Information
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Borrowed At</Typography>
                <Typography variant="body1">
                  {borrowing.borrowedAt ? new Date(borrowing.borrowedAt).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                <Typography variant="body1" color={borrowing.dueDate && new Date(borrowing.dueDate) < new Date() && !borrowing.returnedAt ? 'error' : 'inherit'}>
                  {borrowing.dueDate ? new Date(borrowing.dueDate).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
              {borrowing.returnedAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Returned At</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(borrowing.returnedAt).toLocaleString()}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {borrowing.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Notes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {borrowing.notes}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Related Entities
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<BookIcon />}
                onClick={() => navigate(`/app/books/${borrowing.bookId}`)}
              >
                View Book: {borrowing.bookTitle}
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PersonIcon />}
              >
                User: {borrowing.userName || borrowing.userId}
              </Button>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {borrowing.status !== BorrowingStatus.Returned && (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CheckCircleIcon />}
                fullWidth
                onClick={() => setReturnDialogOpen(true)}
                disabled={returnMutation.isPending}
              >
                Return Book
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>
      
      <ConfirmDialog
        open={returnDialogOpen}
        title="Return Book"
        content="Are you sure you want to mark this book as returned?"
        onConfirm={handleReturn}
        onCancel={() => setReturnDialogOpen(false)}
        confirmText="Return Book"
        confirmColor="success"
      />
    </Box>
  );
}
