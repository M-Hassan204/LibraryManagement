import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
  Box,
  Avatar
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import type { TopBookDto } from '@/types/dashboard.types';

interface TopBorrowedBooksTableProps {
  books?: TopBookDto[];
  isLoading?: boolean;
}

export function TopBorrowedBooksTable({ books, isLoading }: TopBorrowedBooksTableProps): React.ReactElement {
  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
        <Table aria-label="top borrowed books table">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Book Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Borrow Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
        <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary" variant="h6">
          No borrowed books found yet.
        </Typography>
        <Typography color="text.disabled" variant="body2">
          When users start borrowing books, they will appear here.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
      <Table aria-label="top borrowed books table">
        <TableHead sx={{ backgroundColor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Book Details</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Borrow Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow 
              key={book.bookId} 
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                transition: 'background-color 0.2s',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 40, height: 40 }} variant="rounded">
                    <AutoStoriesIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>
                    {book.title}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  N/A
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {book.borrowCount}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
