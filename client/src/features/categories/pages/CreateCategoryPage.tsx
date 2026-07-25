import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CategoryForm } from '../components/CategoryForm';
import { useCreateCategory } from '../hooks/useCategories';
import { ROUTES } from '@/constants/routes';

export default function CreateCategoryPage(): React.ReactElement {
  const navigate = useNavigate();
  const createMutation = useCreateCategory();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description,
      });
      navigate(ROUTES.CATEGORIES);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while creating the category.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Add New Category
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        isEdit={false}
      />
    </Box>
  );
}
