import { useState, type ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Grid, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import { FormTextField } from '@/components/form/FormTextField';
import { FormPasswordField } from '@/components/form/FormPasswordField';
import { LoadingButton } from '@/components/common/LoadingButton';
import { formatError } from '@/utils/formatError';

export function RegisterPage(): ReactElement {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      department: '',
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Backend returns AuthResponseDto on register.
        // It's possible the user is auto-logged in, or requires email verification.
        // For simplicity, we can auto-login if the backend gives a token,
        // or redirect to verify-email if that's the flow.
        login(response.data);
      } else {
        setErrorMsg(response.message || 'Registration failed');
      }
    },
    onError: (error) => {
      setErrorMsg(formatError(error));
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the library to start borrowing books"
    >
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="firstName"
              control={control}
              label="First Name"
              autoComplete="given-name"
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="lastName"
              control={control}
              label="Last Name"
              autoComplete="family-name"
            />
          </Grid>
        </Grid>

        <FormTextField
          name="email"
          control={control}
          label="Email Address"
          autoComplete="email"
        />

        <FormPasswordField
          name="password"
          control={control}
          label="Password"
          autoComplete="new-password"
        />

        <FormPasswordField
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          autoComplete="new-password"
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="studentId"
              control={control}
              label="Student ID (Optional)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="department"
              control={control}
              label="Department (Optional)"
            />
          </Grid>
        </Grid>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          loading={mutation.isPending}
        >
          Sign Up
        </LoadingButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default RegisterPage;
