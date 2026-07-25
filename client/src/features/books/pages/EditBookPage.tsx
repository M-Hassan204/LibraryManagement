import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { BookForm } from '../components/BookForm';
import { useBook, useUpdateBook } from '../hooks/useBooks';
import { ROUTES } from '@/constants/routes';

export default function EditBookPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  
  const { data: book, isLoading: isLoadingBook, isError: isErrorBook, error: errorBook } = useBook(bookId, bookId > 0);
  const updateMutation = useUpdateBook(bookId);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any, file: File | null) => {
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        id: bookId,
        title: data.title,
        isbn: data.isbn,
        description: data.description,
        publishedYear: data.publishedYear,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
      });

      if (file) {
        const { booksApi } = await import('@/api/books.api');
        await booksApi.uploadCoverImage(bookId, file);
      }

      navigate(ROUTES.ADMIN_BOOKS);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while updating the book.');
    }
  };

  if (isLoadingBook) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorBook || !book) {
    return (
      <Box>
        <Alert severity="error">{errorBook?.message || 'Book not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Edit Book
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <BookForm
        initialValues={book}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        isEdit={true}
      />
    </Box>
  );
}
