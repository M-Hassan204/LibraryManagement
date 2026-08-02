import React, { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Toolbar,
  TextField, InputAdornment, Chip, Avatar, Button
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAdminUsers } from '../hooks/useUsers';
import type { UserResourceParameters } from '@/types/user.types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function MembersPage(): React.ReactElement {
  const navigate = useNavigate();
  const [params, setParams] = useState<UserResourceParameters>({
    pageNumber: 1, pageSize: 10, searchTerm: '',
    sortBy: 'registrationDate', sortDescending: true, role: 'Member'
  });

  const { data: pagedUsers, isLoading, isError, error } = useAdminUsers(params);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Library Members</Typography>
        <Typography variant="body1" color="text.secondary">
          Search and view library member profiles and borrowing history.
        </Typography>
      </Box>

      <Card>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined" size="small" placeholder="Search members..."
            value={params.searchTerm || ''}
            onChange={(e) => setParams(prev => ({ ...prev, searchTerm: e.target.value, pageNumber: 1 }))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
        </Toolbar>

        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Loading members...</TableCell></TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="error">
                      {error?.message?.includes('403') 
                        ? 'You are not authorized to view members list.' 
                        : `Error loading members: ${error?.message}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !pagedUsers?.items.length ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No members found.</TableCell></TableRow>
              ) : (
                pagedUsers.items.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.profileImageUrl ? `${import.meta.env.VITE_API_URL}${user.profileImageUrl}` : undefined} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          {!user.profileImageUrl && getInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => navigate(ROUTES.MEMBER_DETAIL(user.id))}>
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]} component="div"
          count={pagedUsers?.totalCount || 0} rowsPerPage={params.pageSize || 10}
          page={(params.pageNumber || 1) - 1}
          onPageChange={(_, newPage) => setParams(prev => ({ ...prev, pageNumber: newPage + 1 }))}
          onRowsPerPageChange={(e) => setParams(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageNumber: 1 }))}
        />
      </Card>
    </Box>
  );
}
