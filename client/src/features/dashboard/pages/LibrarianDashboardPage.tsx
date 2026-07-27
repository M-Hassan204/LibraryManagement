import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default function LibrarianDashboardPage(): React.ReactElement {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Librarian Dashboard</Typography>
      <Card>
        <CardContent>
          <Typography>Welcome to the Librarian Dashboard. Here you can manage books, authors, categories, and borrowings.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}