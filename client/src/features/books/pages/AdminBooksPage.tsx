import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBooks, useDeleteBook } from '../hooks/useBooks';
import { ROUTES } from '@/constants/routes';
import { BookStatus } from '@/types/book.types';
import type { ResourceParameters } from '@/types/api.types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function AdminBooksPage(): React.ReactElement {
  const navigate = useNavigate();
  const [params, setParams] = useState<ResourceParameters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'title',
    sortDescending: false,
  });

  const { data: pagedBooks, isLoading, isError, error } = useBooks(params);
  const deleteMutation = useDeleteBook();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, searchTerm: event.target.value, pageNumber: 1 }));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), pageNumber: 1 }));
  };

  const handleDeleteClick = (id: number) => {
    setBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bookToDelete !== null) {
      await deleteMutation.mutateAsync(bookToDelete);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case BookStatus.Available:
        return 'success';
      case BookStatus.Borrowed:
        return 'warning';
      case BookStatus.Reserved:
        return 'info';
      case BookStatus.Unavailable:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: BookStatus) => {
    return BookStatus[status] || 'Unknown';
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Books Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.ADMIN_BOOK_CREATE)}
        >
          Add Book
        </Button>
      </Box>

      <Card>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search books by title, author, or ISBN..."
              value={params.searchTerm || ''}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ width: { xs: '100%', sm: 400 } }}
            />
        </Toolbar>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>ISBN</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Loading books...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }} color="error">
                    Error loading books: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !pagedBooks?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No books found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedBooks.items.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{book.title}</TableCell>
                    <TableCell>{book.author?.name}</TableCell>
                    <TableCell>{book.category?.name}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(book.status)}
                        color={getStatusColor(book.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/books/${book.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/app/books/${book.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(book.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagedBooks?.totalCount || 0}
          rowsPerPage={params.pageSize || 10}
          page={(params.pageNumber || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Book"
        content="Are you sure you want to delete this book? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
