import React, { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Snackbar, Alert as MuiAlert } from '@mui/material';
import { useAllBorrowings, useReturnBook } from '../hooks/useBorrowings';
import { BorrowingStatus } from '@/types/borrowing.types';
import type { ResourceParameters } from '@/types/api.types';
import { BorrowBookDialog } from '../components/BorrowBookDialog';
import { EmptyState } from '@/components/common/EmptyState';

export default function AllBorrowingsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [params, setParams] = useState<ResourceParameters>({
    pageNumber: 1,
    pageSize: 50,
    sortBy: 'borrowedAt',
    sortDescending: true,
  });

  const [currentTab, setCurrentTab] = useState(0);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);

  const { data: pagedBorrowings, isLoading, isError, error } = useAllBorrowings(params);
  const returnMutation = useReturnBook();
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleChangePage = (_event: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), pageNumber: 1 }));
  };

  const handleReturn = async (id: number) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await returnMutation.mutateAsync({ id, data: { notes: 'Returned by Admin' } });
        setSnackbar({ open: true, message: 'Book returned successfully', severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || 'Failed to return book', severity: 'error' });
      }
    }
  };

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Filter the current page items based on the active tab
  const getFilteredBorrowings = () => {
    if (!pagedBorrowings?.items) return [];
    
    switch (currentTab) {
      case 1: // Borrowed
        return pagedBorrowings.items.filter(b => b.status === BorrowingStatus.Borrowed);
      case 2: // Overdue
        return pagedBorrowings.items.filter(b => b.status === BorrowingStatus.Overdue);
      case 3: // History
        return pagedBorrowings.items.filter(b => b.status === BorrowingStatus.Returned || b.status === BorrowingStatus.Lost);
      default: // All
        return pagedBorrowings.items;
    }
  };

  const filteredBorrowings = getFilteredBorrowings();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Borrowings Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setBorrowDialogOpen(true)}
        >
          Borrow Book
        </Button>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="borrowings tabs">
            <Tab label="All Borrowings" />
            <Tab label="Active" />
            <Tab label="Overdue" />
            <Tab label="History" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Book Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Borrowed At</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Returned At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(3)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton animation="wave" height={24} width="60%" /></TableCell>
                    <TableCell><Skeleton animation="wave" height={24} width="60%" /></TableCell>
                    <TableCell><Skeleton animation="wave" height={24} width="80%" /></TableCell>
                    <TableCell><Skeleton animation="wave" height={24} width="80%" /></TableCell>
                    <TableCell><Skeleton animation="wave" height={24} width="80%" /></TableCell>
                    <TableCell><Skeleton animation="wave" height={24} width={80} /></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }} color="error">
                    Error loading borrowings: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !filteredBorrowings.length ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <EmptyState 
                      title="No borrowings found" 
                      description="There are no borrowings matching this filter."
                      actionText="Borrow Book"
                      onAction={() => setBorrowDialogOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredBorrowings.map((borrowing) => (
                  <TableRow key={borrowing.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{borrowing.bookTitle}</TableCell>
                    <TableCell>{borrowing.userName || borrowing.userId}</TableCell>
                    <TableCell>{borrowing.borrowedAt ? new Date(borrowing.borrowedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{borrowing.dueDate ? new Date(borrowing.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {borrowing.returnedAt ? new Date(borrowing.returnedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(borrowing.status)}
                        color={getStatusColor(borrowing.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        color="info"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/app/borrowings/${borrowing.id}`)}
                        sx={{ mr: 1 }}
                      >
                        Details
                      </Button>
                      {borrowing.status !== BorrowingStatus.Returned && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleReturn(borrowing.id)}
                          disabled={returnMutation.isPending}
                        >
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagedBorrowings?.totalCount || 0}
          rowsPerPage={params.pageSize || 50}
          page={(params.pageNumber || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      
      <BorrowBookDialog
        open={borrowDialogOpen}
        onClose={() => setBorrowDialogOpen(false)}
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
