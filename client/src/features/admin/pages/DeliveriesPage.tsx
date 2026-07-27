import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { usePendingDeliveries, useUpdateDeliveryStatus } from '../hooks/useDeliveries';
import { DeliveryStatus } from '@/types/delivery.types';

export default function DeliveriesPage(): React.ReactElement {
  const { data: response, isLoading, isError, error } = usePendingDeliveries();
  const updateMutation = useUpdateDeliveryStatus();

  const handleUpdateStatus = (id: number, status: DeliveryStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  if (isLoading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error">{error?.message || 'Failed to load deliveries'}</Alert>;

  const deliveries = response?.data || [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>Pending Deliveries</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="deliveries table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Book</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((row) => (
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{row.id}</TableCell>
                <TableCell>{row.userFullName}</TableCell>
                <TableCell>{row.bookTitle}</TableCell>
                <TableCell>{row.deliveryAddress}</TableCell>
                <TableCell>{DeliveryStatus[row.status]}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleUpdateStatus(row.id, DeliveryStatus.Dispatched)}
                      disabled={row.status !== DeliveryStatus.Pending || updateMutation.isPending}
                    >
                      Dispatch
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success"
                      size="small" 
                      onClick={() => handleUpdateStatus(row.id, DeliveryStatus.Delivered)}
                      disabled={row.status !== DeliveryStatus.Dispatched || updateMutation.isPending}
                    >
                      Deliver
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
