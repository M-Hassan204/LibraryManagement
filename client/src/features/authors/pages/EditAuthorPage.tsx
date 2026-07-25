import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthorForm } from '../components/AuthorForm';
import { useAuthor, useUpdateAuthor } from '../hooks/useAuthors';
import { ROUTES } from '@/constants/routes';

export default function EditAuthorPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const authorId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  
  const { data: author, isLoading: isLoadingAuthor, isError: isErrorAuthor, error: errorAuthor } = useAuthor(authorId, authorId > 0);
  const updateMutation = useUpdateAuthor(authorId);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        id: authorId,
        name: data.name,
        biography: data.biography,
      });
      navigate(ROUTES.AUTHORS);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while updating the author.');
    }
  };

  if (isLoadingAuthor) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorAuthor || !author) {
    return (
      <Box>
        <Alert severity="error">{errorAuthor?.message || 'Author not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Edit Author
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <AuthorForm
        initialValues={author}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        isEdit={true}
      />
    </Box>
  );
}
