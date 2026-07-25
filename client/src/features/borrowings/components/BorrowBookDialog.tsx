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

  const handleBorrow = async () => {
    if (selectedBookId !== '') {
      await borrowMutation.mutateAsync({ bookId: selectedBookId as number });
      setSelectedBookId('');
      onClose();
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
    </Dialog>
  );
}
