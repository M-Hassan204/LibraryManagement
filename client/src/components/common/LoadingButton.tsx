import { Button, CircularProgress, type ButtonProps } from '@mui/material';
import type { ReactElement } from 'react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

/**
 * Reusable Button that displays a loading spinner and disables itself
 * when the `loading` prop is true.
 */
export function LoadingButton({
  children,
  loading = false,
  disabled,
  ...rest
}: LoadingButtonProps): ReactElement {
  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress color="inherit" size={20} /> : rest.startIcon
      }
    >
      {children}
    </Button>
  );
}
