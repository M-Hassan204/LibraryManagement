import React from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Skeleton, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMyBorrowings } from '@/features/borrowings/hooks/useBorrowings';
import { BorrowingStatus } from '@/types/borrowing.types';
import { ROUTES } from '@/constants/routes';
import { ImportContacts as ReadIcon } from '@mui/icons-material';

export default function MyBorrowingsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: borrowings, isLoading } = useMyBorrowings();

  const getStatusColor = (status: BorrowingStatus) => {
    switch (status) {
      case BorrowingStatus.Active: return 'primary';
      case BorrowingStatus.Returned: return 'success';
      case BorrowingStatus.Overdue: return 'error';
      case BorrowingStatus.Lost: return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        My Borrowings
      </Typography>

      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Borrowed Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Returned At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : borrowings && borrowings.length > 0 ? (
                borrowings.map((borrowing) => (
                  <TableRow key={borrowing.id} hover>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate(`/books/${borrowing.bookId}`)}
                      >
                        {borrowing.bookTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(borrowing.borrowedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color={new Date(borrowing.dueDate) < new Date() && !borrowing.returnedAt ? 'error' : 'textPrimary'}>
                        {new Date(borrowing.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {borrowing.returnedAt ? new Date(borrowing.returnedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={BorrowingStatus[borrowing.status]} 
                        color={getStatusColor(borrowing.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {borrowing.status !== BorrowingStatus.Returned && borrowing.status !== BorrowingStatus.Lost && (
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<ReadIcon />}
                          onClick={() => navigate(`/app/books/${borrowing.bookId}/read`)}
                        >
                          Read Online
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">You haven't borrowed any books yet.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(ROUTES.BOOKS)}>
                      Browse Catalogue
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
