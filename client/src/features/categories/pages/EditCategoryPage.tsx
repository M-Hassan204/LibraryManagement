import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryForm } from '../components/CategoryForm';
import { useCategory, useUpdateCategory } from '../hooks/useCategories';
import { ROUTES } from '@/constants/routes';

export default function EditCategoryPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const categoryId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  
  const { data: category, isLoading: isLoadingCategory, isError: isErrorCategory, error: errorCategory } = useCategory(categoryId, categoryId > 0);
  const updateMutation = useUpdateCategory(categoryId);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        id: categoryId,
        name: data.name,
        description: data.description,
      });
      navigate(ROUTES.CATEGORIES);
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred while updating the category.');
    }
  };

  if (isLoadingCategory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorCategory || !category) {
    return (
      <Box>
        <Alert severity="error">{errorCategory?.message || 'Category not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Edit Category
      </Typography>

      {errorMsg && (
        <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      <CategoryForm
        initialValues={category}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        isEdit={true}
      />
    </Box>
  );
}
