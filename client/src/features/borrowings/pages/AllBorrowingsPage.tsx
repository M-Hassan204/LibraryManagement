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
} from '@mui/icons-material';
import { useAllBorrowings, useReturnBook } from '../hooks/useBorrowings';
import { BorrowingStatus } from '@/types/borrowing.types';
import type { ResourceParameters } from '@/types/api.types';
import { BorrowBookDialog } from '../components/BorrowBookDialog';

export default function AllBorrowingsPage(): React.ReactElement {
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), pageNumber: 1 }));
  };

  const handleReturn = async (id: number) => {
    if (window.confirm('Mark this book as returned?')) {
      await returnMutation.mutateAsync({ id, data: { notes: 'Returned by Admin' } });
    }
  };

  const getStatusColor = (status: BorrowingStatus) => {
    switch (status) {
      case BorrowingStatus.Active:
        return 'primary';
      case BorrowingStatus.Returned:
        return 'success';
      case BorrowingStatus.Overdue:
        return 'error';
      case BorrowingStatus.Lost:
        return 'default';
      default:
        return 'default';
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
      case 1: // Active
        return pagedBorrowings.items.filter(b => b.status === BorrowingStatus.Active);
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <TableCell>User ID</TableCell>
                <TableCell>Borrowed At</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Returned At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Loading borrowings...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }} color="error">
                    Error loading borrowings: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !filteredBorrowings.length ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No borrowings found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBorrowings.map((borrowing) => (
                  <TableRow key={borrowing.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{borrowing.bookTitle}</TableCell>
                    <TableCell>{borrowing.userId}</TableCell>
                    <TableCell>{new Date(borrowing.borrowedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(borrowing.dueDate).toLocaleDateString()}</TableCell>
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
    </Box>
  );
}
