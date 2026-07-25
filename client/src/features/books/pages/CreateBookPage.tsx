import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookForm } from '../components/BookForm';
import { useCreateBook } from '../hooks/useBooks';
import { ROUTES } from '@/constants/routes';

export default function CreateBookPage(): React.ReactElement {
  const navigate = useNavigate();
  const createMutation = useCreateBook();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any, file: File | null) => {
    setErrorMsg(null);
    try {
      const newBook = await createMutation.mutateAsync({
        title: data.title,
        isbn: data.isbn,
        description: data.description,
        publishedYear: data.publishedYear,
        categoryId: data.categoryId,
        authorId: data.authorId,
      });

      if (file && newBook.id) {
        // Upload image using the newly created book ID
        // Note: useUploadBookCover is a hook that normally binds to an ID, 
        // we can just call mutateAsync directly or create a generic upload func.
        // Wait, useUploadBookCover returns a mutation, but it is bound to the ID passed in.
        // We can just use the booksApi directly here to avoid hook complexity for dynamic ID,
        // OR we can pass newBook.id to the upload api call.
        // Since we are inside the component, let's use the api directly to avoid recreating hook.
        // Or better yet, we can use the `uploadMutation` but we need to pass `id` to mutationFn if it was modified.
        // Let's modify useUploadBookCover in useBooks.ts so the mutation accepts {id, file}.
        // For now, I'll update it later if needed, but actually I can just use `uploadCoverImage` from api.
        const { booksApi } = await import('@/api/books.api');
        await booksApi.uploadCoverImage(newBook.id, file);
      }

      navigate(ROUTES.ADMIN_BOOKS);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while creating the book.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Add New Book
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <BookForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        isEdit={false}
      />
    </Box>
  );
}
