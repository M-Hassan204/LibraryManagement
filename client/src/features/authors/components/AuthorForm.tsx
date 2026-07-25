import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Card, Grid } from '@mui/material';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingButton } from '@/components/common/LoadingButton';

const authorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  biography: z.string().optional(),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

interface AuthorFormProps {
  initialValues?: Partial<AuthorFormValues>;
  onSubmit: (data: AuthorFormValues) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function AuthorForm({ initialValues, onSubmit, isLoading, isEdit = false }: AuthorFormProps) {
  const { control, handleSubmit } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: initialValues?.name || '',
      biography: initialValues?.biography || '',
    },
  });

  // handleFormSubmit

  const handleFormSubmit = async (data: AuthorFormValues) => {
    await onSubmit(data);
  };

  return (
    <Card sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="name" control={control} label="Name" required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="biography"
              control={control}
              label="Biography"
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
            {isEdit ? 'Update Author' : 'Create Author'}
          </LoadingButton>
        </Box>
      </Box>
    </Card>
  );
}
