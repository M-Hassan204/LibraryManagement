import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Toolbar,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  PersonOff as PersonOffIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAdminUsers, useDeleteAdminUser, useLockUser, useUnlockUser, useActivateUser, useDeactivateUser } from '../hooks/useUsers';
import type { UserResourceParameters, AdminUserDto } from '@/types/user.types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { UserFormDialog } from '../components/UserFormDialog';
import { UserRolesDialog } from '../components/UserRolesDialog';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage(): React.ReactElement {
  const { user: currentUser } = useAuth();
  
  const [params, setParams] = useState<UserResourceParameters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'registrationDate',
    sortDescending: true,
  });

  const { data: pagedUsers, isLoading, isError, error } = useAdminUsers(params);
  
  const deleteMutation = useDeleteAdminUser();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<AdminUserDto | null>(null);

  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, searchTerm: event.target.value, pageNumber: 1 }));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), pageNumber: 1 }));
  };

  const handleSortChange = (event: any) => {
    const value = event.target.value;
    const [sortBy, sortDescending] = value.split('|');
    setParams((prev) => ({ 
      ...prev, 
      sortBy, 
      sortDescending: sortDescending === 'desc',
      pageNumber: 1
    }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: AdminUserDto) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleConfirmDelete = async () => {
    if (menuUser) {
      await deleteMutation.mutateAsync(menuUser.id);
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const isCurrentUser = menuUser?.email === currentUser?.email;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Users Management
        </Typography>
      </Box>

      <Card>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search users..."
            value={params.searchTerm || ''}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={params.role || ''}
              label="Role"
              onChange={(e) => setParams(prev => ({ ...prev, role: e.target.value || undefined, pageNumber: 1 }))}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Librarian">Librarian</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={params.isActive === undefined ? '' : params.isActive.toString()}
              label="Status"
              onChange={(e) => {
                const val = e.target.value;
                setParams(prev => ({ ...prev, isActive: val === '' ? undefined : val === 'true', pageNumber: 1 }));
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Deactivated</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={`${params.sortBy}|${params.sortDescending ? 'desc' : 'asc'}`}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="firstname|asc">Name (A-Z)</MenuItem>
              <MenuItem value="firstname|desc">Name (Z-A)</MenuItem>
              <MenuItem value="registrationdate|desc">Newest First</MenuItem>
              <MenuItem value="registrationdate|asc">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>

        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }} color="error">
                    Error loading users: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !pagedUsers?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedUsers.items.map((user) => {
                  const isLocked = user.lockoutEnabled && user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
                  
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={user.profileImageUrl 
                              ? `${import.meta.env.VITE_API_URL}${user.profileImageUrl}`
                              : undefined
                            }
                            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                          >
                            {!user.profileImageUrl && getInitials(user.firstName, user.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {user.roles.map(role => (
                            <Chip 
                              key={role} 
                              label={role} 
                              size="small" 
                              color={role === 'Admin' ? 'primary' : 'default'} 
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Deactivated'} 
                            color={user.isActive ? 'success' : 'error'} 
                            size="small" 
                          />
                          {isLocked && (
                            <Chip 
                              label="Locked" 
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagedUsers?.totalCount || 0}
          rowsPerPage={params.pageSize || 10}
          page={(params.pageNumber || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setEditDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { setRolesDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Roles</ListItemText>
        </MenuItem>

        {menuUser?.lockoutEnabled && menuUser?.lockoutEnd && new Date(menuUser.lockoutEnd) > new Date() ? (
          <MenuItem 
            onClick={async () => {
              await unlockMutation.mutateAsync(menuUser.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon><LockOpenIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Unlock User</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem 
            disabled={isCurrentUser}
            onClick={async () => {
              await lockMutation.mutateAsync(menuUser!.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon><LockIcon fontSize="small" color="warning" /></ListItemIcon>
            <ListItemText>Lock User</ListItemText>
          </MenuItem>
        )}

        {menuUser?.isActive ? (
          <MenuItem 
            disabled={isCurrentUser}
            onClick={async () => {
              await deactivateMutation.mutateAsync(menuUser.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon><PersonOffIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={async () => {
              await activateMutation.mutateAsync(menuUser!.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon><PersonIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}

        <MenuItem 
          disabled={isCurrentUser}
          onClick={() => { setDeleteDialogOpen(true); setAnchorEl(null); }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      <UserFormDialog 
        open={editDialogOpen} 
        onClose={() => { setEditDialogOpen(false); handleMenuClose(); }} 
        user={menuUser} 
      />

      <UserRolesDialog 
        open={rolesDialogOpen} 
        onClose={() => { setRolesDialogOpen(false); handleMenuClose(); }} 
        user={menuUser} 
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        content={`Are you sure you want to completely delete ${menuUser?.fullName}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteDialogOpen(false); handleMenuClose(); }}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
