import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Container, Card, CardContent } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { useBook } from '../hooks/useBooks';
import { useMySubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import { SubscriptionPlan } from '@/types/subscription.types';
import LockIcon from '@mui/icons-material/Lock';

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function BookReaderPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading, isError } = useBook(Number(id));

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const { data: subscription } = useMySubscription();

  // Example sub check: you should replace this with real subscription logic
  const isPremium = subscription?.data?.plan === SubscriptionPlan.Premium;
  const MAX_FREE_PAGES = 20;
  const isLocked = !isPremium && pageNumber > MAX_FREE_PAGES;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (isError || !book) return <Box sx={{ p: 5 }}><Typography color="error">Failed to load book.</Typography></Box>;

  // In a real app, book.pdfUrl would point to the actual PDF file.
  // Here we use a placeholder or assume the book has a pdfUrl property (need to add it or fake it for demo).
  const pdfUrl = (book as any).pdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'; // Fallback sample PDF

  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{book.title}</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} variant="outlined">Previous</Button>
        <Typography>Page {pageNumber} of {numPages || '--'}</Typography>
        <Button disabled={pageNumber >= (numPages || 1) || isLocked} onClick={() => setPageNumber(p => p + 1)} variant="outlined">Next</Button>
        
        <Button onClick={() => setScale(s => s + 0.2)} variant="text">Zoom In</Button>
        <Button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} variant="text">Zoom Out</Button>
      </Box>

      <Paper elevation={3} sx={{ position: 'relative', minHeight: 600, display: 'flex', justifyContent: 'center', p: 2, overflow: 'auto', width: '100%', maxWidth: '100%', bgcolor: 'grey.100' }}>
        {!isLocked ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<CircularProgress />}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={false} 
              renderAnnotationLayer={false}
            />
          </Document>
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.8)', zIndex: 10, color: 'white' }}>
            <Card sx={{ maxWidth: 400, textAlign: 'center', p: 3 }}>
              <CardContent>
                <LockIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>Premium Content</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You've reached the limit of {MAX_FREE_PAGES} free pages. Upgrade to Premium to read the rest of the book and enjoy unlimited reading!
                </Typography>
                <Button variant="contained" color="primary" size="large" onClick={() => navigate('/app/profile')}>
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
}