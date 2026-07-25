import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthorForm } from '../components/AuthorForm';
import { useCreateAuthor } from '../hooks/useAuthors';
import { ROUTES } from '@/constants/routes';

export default function CreateAuthorPage(): React.ReactElement {
  const navigate = useNavigate();
  const createMutation = useCreateAuthor();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await createMutation.mutateAsync({
        name: data.name,
        biography: data.biography,
      });
      navigate(ROUTES.AUTHORS);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while creating the author.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Add New Author
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <AuthorForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        isEdit={false}
      />
    </Box>
  );
}
