import { useState, type ReactElement } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { FormTextField } from '@/components/form/FormTextField';
import { FormPasswordField } from '@/components/form/FormPasswordField';
import { LoadingButton } from '@/components/common/LoadingButton';
import { formatError } from '@/utils/formatError';

export function LoginPage(): ReactElement {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        if (response.data.requiresTwoFactor) {
          // If 2FA is required, redirect to OTP page
          navigate('/verify-otp', { state: { email: response.data.email } });
        } else {
          // Otherwise, log in the user
          login(response.data);
        }
      } else {
        setErrorMsg(response.message || 'Login failed');
      }
    },
    onError: (error) => {
      setErrorMsg(formatError(error));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          name="email"
          control={control}
          label="Email Address"
          autoComplete="email"
          autoFocus
        />

        <FormPasswordField
          name="password"
          control={control}
          label="Password"
          autoComplete="current-password"
        />

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          loading={mutation.isPending}
        >
          Sign In
        </LoadingButton>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
          <Link component={RouterLink} to="/register" variant="body2">
            Don't have an account? Sign up
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default LoginPage;
