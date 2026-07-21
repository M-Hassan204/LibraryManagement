import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Button } from '@mui/material';
import { CheckCircleOutlined, ErrorOutlined } from '@mui/icons-material';

import { authApi } from '@/api/auth.api';
import { AuthLayout } from '../components/AuthLayout';
import { formatError } from '@/utils/formatError';

export function VerifyEmailPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing email or token.');
      return;
    }

    // Call API to verify email
    authApi
      .verifyEmail({ email, token })
      .then((res) => {
        if (res.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully.');
        } else {
          setStatus('error');
          setMessage(res.message || 'Email verification failed.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(formatError(err));
      });
  }, [email, token]);

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={status === 'loading' ? 'Please wait...' : 'Verification status'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
        {status === 'loading' && <CircularProgress size={48} sx={{ mb: 3 }} />}

        {status === 'success' && (
          <>
            <CheckCircleOutlined color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlined color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {message}
            </Alert>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </>
        )}
      </Box>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
