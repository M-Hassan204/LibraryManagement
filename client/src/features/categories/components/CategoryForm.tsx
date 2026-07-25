import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Card, Grid } from '@mui/material';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingButton } from '@/components/common/LoadingButton';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function CategoryForm({ initialValues, onSubmit, isLoading, isEdit = false }: CategoryFormProps) {
  const control = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
  });

  const { handleSubmit } = control;

  const handleFormSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
  };

  return (
    <Card sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="name" control={control.control} label="Name" required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="description"
              control={control.control}
              label="Description"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
          >
            {isEdit ? 'Update Category' : 'Create Category'}
          </LoadingButton>
        </Box>
      </Box>
    </Card>
  );
}
