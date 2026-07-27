import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { useBooks } from '../../books/hooks/useBooks';
import { useBorrowBook } from '../hooks/useBorrowings';

interface BorrowBookDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BorrowBookDialog({ open, onClose }: BorrowBookDialogProps): React.ReactElement {
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  
  // Fetch a list of books for the dropdown. 
  const { data: pagedBooks, isLoading: isLoadingBooks } = useBooks({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'title',
  });
  
  const borrowMutation = useBorrowBook();
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleBorrow = async () => {
    if (selectedBookId !== '') {
      try {
        await borrowMutation.mutateAsync({ bookId: selectedBookId as number, homeDelivery: false });
        setSnackbar({ open: true, message: 'Book borrowed successfully', severity: 'success' });
        setSelectedBookId('');
        onClose();
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || 'Failed to borrow book', severity: 'error' });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Borrow a Book</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {isLoadingBooks ? (
          <CircularProgress />
        ) : (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="book-select-label">Select Book</InputLabel>
            <Select
              labelId="book-select-label"
              value={selectedBookId}
              label="Select Book"
              onChange={(e) => setSelectedBookId(e.target.value as number)}
            >
              {pagedBooks?.items.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.title} (ID: {book.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleBorrow} 
          color="primary" 
          variant="contained" 
          disabled={selectedBookId === '' || borrowMutation.isPending}
        >
          {borrowMutation.isPending ? 'Borrowing...' : 'Borrow Book'}
        </Button>
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
}
