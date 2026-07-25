import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthors, useDeleteAuthor } from '../hooks/useAuthors';
import { ROUTES } from '@/constants/routes';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function AuthorsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: authors, isLoading, isError, error } = useAuthors();
  const deleteMutation = useDeleteAuthor();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setAuthorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (authorToDelete !== null) {
      await deleteMutation.mutateAsync(authorToDelete);
      setDeleteDialogOpen(false);
      setAuthorToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAuthorToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Authors Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.AUTHOR_CREATE)}
        >
          Add Author
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Biography</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    Loading authors...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }} color="error">
                    Error loading authors: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !authors?.length ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    No authors found.
                  </TableCell>
                </TableRow>
              ) : (
                authors.map((author) => (
                  <TableRow key={author.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{author.name}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {author.biography || '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/app/authors/${author.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(author.id)}
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
      </Card>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Author"
        content="Are you sure you want to delete this author? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
