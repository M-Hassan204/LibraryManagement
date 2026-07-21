import { useEffect, useState, type ReactElement } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { AuthLayout } from '../components/AuthLayout';
import { verifyOtpSchema, type VerifyOtpFormData } from '../schemas/auth.schemas';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingButton } from '@/components/common/LoadingButton';
import { formatError } from '@/utils/formatError';

export function VerifyOtpPage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email as string | undefined;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If there's no email in state, the user navigated here directly without logging in first.
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const { control, handleSubmit } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (response) => {
      if (response.success) {
        setSuccessMsg('OTP verified successfully. You can now log in.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setErrorMsg(response.message || 'OTP verification failed.');
      }
    },
    onError: (error) => {
      setErrorMsg(formatError(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: (response) => {
      if (response.success) {
        setSuccessMsg('A new OTP has been sent to your email.');
      } else {
        setErrorMsg(response.message || 'Failed to resend OTP.');
      }
    },
    onError: (error) => {
      setErrorMsg(formatError(error));
    },
  });

  const onSubmit = (data: VerifyOtpFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (email) {
      verifyMutation.mutate({ email, otp: data.otp });
    }
  };

  const handleResend = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (email) {
      resendMutation.mutate({ email });
    }
  };

  if (!email) return <></>;

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          name="otp"
          control={control}
          label="6-Digit OTP"
          autoComplete="one-time-code"
          autoFocus
          slotProps={{ htmlInput: { maxLength: 6 } }}
        />

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          loading={verifyMutation.isPending}
        >
          Verify
        </LoadingButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <LoadingButton
            onClick={handleResend}
            loading={resendMutation.isPending}
            disabled={verifyMutation.isPending}
            variant="text"
            size="small"
          >
            Resend Code
          </LoadingButton>
          
          <Link component={RouterLink} to="/login" variant="body2" sx={{ mt: 1 }}>
            Back to login
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default VerifyOtpPage;
