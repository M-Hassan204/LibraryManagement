import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { AdminUserDto, UpdateAdminUserRequestDto } from '@/types/user.types';
import { useUpdateAdminUser } from '../hooks/useUsers';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminUserDto | null;
}

export function UserFormDialog({ open, onClose, user }: UserFormDialogProps): React.ReactElement {
  const { control, handleSubmit, reset } = useForm<UpdateAdminUserRequestDto>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      phoneNumber: '',
    },
  });

  const updateMutation = useUpdateAdminUser();

  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: UpdateAdminUserRequestDto) => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({ id: user.id, data });
      onClose();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User: {user?.fullName}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
