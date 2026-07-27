import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSubscriptions, useUpdateSubscription } from '../hooks/useSubscriptions';
import type { ResourceParameters } from '@/types/api.types';
import { SubscriptionPlan, SubscriptionStatus, type SubscriptionDto } from '@/types/subscription.types';

export default function AdminSubscriptionsPage(): React.ReactElement {
  const [params, setParams] = useState<ResourceParameters>({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data: pagedSubscriptions, isLoading, isError, error } = useSubscriptions(params);
  const updateMutation = useUpdateSubscription();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), pageNumber: 1 }));
  };

  const handleApprove = (sub: SubscriptionDto) => {
    updateMutation.mutate({ 
      subscriptionId: sub.id, 
      plan: sub.plan,
      endDate: sub.endDate,
      status: SubscriptionStatus.Active 
    });
  };

  const handleReject = (sub: SubscriptionDto) => {
    updateMutation.mutate({ 
      subscriptionId: sub.id, 
      plan: sub.plan,
      endDate: sub.endDate,
      status: SubscriptionStatus.Rejected 
    });
  };

  const getPlanLabel = (plan: SubscriptionPlan) => {
    return SubscriptionPlan[plan] || 'Unknown';
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.Active:
        return 'success';
      case SubscriptionStatus.Pending:
        return 'warning';
      case SubscriptionStatus.Rejected:
      case SubscriptionStatus.Canceled:
      case SubscriptionStatus.Expired:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SubscriptionStatus) => {
    return SubscriptionStatus[status] || 'Unknown';
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Subscription Management
        </Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }} color="error">
                    Error loading subscriptions: {error?.message}
                  </TableCell>
                </TableRow>
              ) : !pagedSubscriptions?.data?.items?.length ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedSubscriptions.data.items.map((sub: SubscriptionDto) => (
                  <TableRow key={sub.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{sub.userFullName}</TableCell>
                    <TableCell>{sub.userEmail}</TableCell>
                    <TableCell>
                      <Chip label={getPlanLabel(sub.plan)} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(sub.status)}
                        color={getStatusColor(sub.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(sub.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      {sub.status === SubscriptionStatus.Pending && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              onClick={() => handleApprove(sub)}
                              disabled={updateMutation.isPending}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              onClick={() => handleReject(sub)}
                              disabled={updateMutation.isPending}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagedSubscriptions?.data?.totalCount || 0}
          rowsPerPage={params.pageSize || 10}
          page={(params.pageNumber || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
