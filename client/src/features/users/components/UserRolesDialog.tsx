import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import type { AdminUserDto } from '@/types/user.types';
import { useAssignRole, useRemoveRole } from '../hooks/useUsers';

interface UserRolesDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminUserDto | null;
}

const AVAILABLE_ROLES = ['Admin', 'User', 'Librarian'];

export function UserRolesDialog({ open, onClose, user }: UserRolesDialogProps): React.ReactElement {
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;
    try {
      await assignRoleMutation.mutateAsync({ id: user.id, data: { role: selectedRole } });
      setSelectedRole('');
    } catch (error) {
      // Handled in mutation
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (!user) return;
    try {
      await removeRoleMutation.mutateAsync({ id: user.id, role });
    } catch (error) {
      // Handled in mutation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Roles: {user?.fullName}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Current Roles
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {user?.roles?.length ? (
            user.roles.map((role) => (
              <Chip
                key={role}
                label={role}
                color={role === 'Admin' ? 'primary' : 'default'}
                onDelete={
                  removeRoleMutation.isPending
                    ? undefined
                    : () => handleRemoveRole(role)
                }
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No roles assigned.
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Assign New Role
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl fullWidth size="small">
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label="Select Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {AVAILABLE_ROLES.filter(r => !user?.roles?.includes(r)).map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={!selectedRole || assignRoleMutation.isPending}
            onClick={handleAssignRole}
            sx={{ minWidth: 100 }}
          >
            Assign
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
