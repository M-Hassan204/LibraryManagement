import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  List,
  ListItem,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PersonIcon from '@mui/icons-material/Person';
import TitleIcon from '@mui/icons-material/Title';
import { booksApi } from '@/api/books.api';
import type { BookMetadata } from '@/types/book.types';

// ─── Public contract used by BookForm ────────────────────────────────────────

export interface ImportedBookData {
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  publisher?: string;
  /** Raw publishedDate string — may be full ISO date or just a year, e.g. "1999" or "1999-07-09" */
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  categories: string[];
  pageCount?: number;
  language?: string;
  coverImageUrl?: string;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

/**
 * Converts a BookMetadata DTO (returned by the backend) into the ImportedBookData
 * shape expected by BookForm.handleImport.
 *
 * Key differences:
 *   BookMetadata.publishedYear (number) → ImportedBookData.publishedDate (string year)
 *   BookMetadata.pages          (number) → ImportedBookData.pageCount     (number)
 */
function metadataToImportedData(m: BookMetadata): ImportedBookData {
  return {
    title: m.title,
    authors: m.authors,
    description: m.description,
    publisher: m.publisher,
    publishedDate: m.publishedYear != null ? String(m.publishedYear) : undefined,
    isbn10: m.isbn10,
    isbn13: m.isbn13,
    categories: m.categories,
    pageCount: m.pages,
    language: m.language,
    coverImageUrl: m.coverImageUrl,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface BookSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (bookData: ImportedBookData) => void;
}

export function BookSearchDialog({ open, onClose, onImport }: BookSearchDialogProps): React.ReactElement {
  const [titleQuery, setTitleQuery] = useState('');
  const [isbnQuery, setIsbnQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const canSearch = Boolean(titleQuery.trim() || isbnQuery.trim() || authorQuery.trim());

  const handleSearch = async () => {
    if (!canSearch) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const response = await booksApi.searchBooks({
        isbn: isbnQuery.trim() || undefined,
        title: titleQuery.trim() || undefined,
        author: authorQuery.trim() || undefined,
      });

      if (!response.success || !response.data) {
        setError(response.message || 'No results found. Try a different title, author, or ISBN.');
        return;
      }

      if (response.data.length === 0) {
        setError('No books found for this query. Try different search terms.');
        return;
      }

      setResults(response.data);
    } catch (err: any) {
      // Axios wraps HTTP errors; extract the most useful message
      const apiMessage = err?.response?.data?.message;
      const statusCode = err?.response?.status;
      if (apiMessage) {
        setError(`Backend error: ${apiMessage}`);
      } else if (statusCode === 401 || statusCode === 403) {
        setError('Authentication error — please log in again.');
      } else if (statusCode) {
        setError(`Backend returned HTTP ${statusCode}. Check server logs.`);
      } else if (err?.message?.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the backend server. Ensure the API is running.');
      } else {
        setError(err?.message || 'An unexpected error occurred. Check the browser console.');
      }
      console.error('[BookSearchDialog] Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSearch();
    }
  };

  const handleReset = () => {
    setTitleQuery('');
    setIsbnQuery('');
    setAuthorQuery('');
    setResults([]);
    setError(null);
    setSearched(false);
  };

  const handleSelect = (book: BookMetadata) => {
    onImport(metadataToImportedData(book));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Import Book From Internet
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* ── Search Inputs ─────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Search by title, author, ISBN, or any combination.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Title"
              placeholder="e.g. Clean Code"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Author"
              placeholder="e.g. Robert C. Martin"
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="ISBN"
              placeholder="e.g. 9780132350884"
              value={isbnQuery}
              onChange={(e) => setIsbnQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FingerprintIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => void handleSearch()}
              disabled={loading || !canSearch}
              startIcon={<SearchIcon />}
              sx={{ flexShrink: 0 }}
            >
              Search
            </Button>
            {searched && (
              <Button variant="text" onClick={handleReset} color="inherit">
                Clear
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* ── Loading ───────────────────────────────────────── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 6 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Searching Google Books…
            </Typography>
          </Box>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {error && !loading && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center', py: 4 }}>
            {error}
          </Typography>
        )}

        {/* ── Idle hint ─────────────────────────────────────── */}
        {!loading && !error && !searched && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
            <MenuBookIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">
              Search results will appear here.
            </Typography>
          </Box>
        )}

        {/* ── Results ───────────────────────────────────────── */}
        {!loading && results.length > 0 && (
          <List sx={{ maxHeight: 480, overflowY: 'auto', p: 0 }} disablePadding>
            {results.map((book, idx) => {
              const displayIsbn = book.isbn13 ?? book.isbn10;

              return (
                <ListItem
                  key={idx}
                  disablePadding
                  sx={{
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                      boxShadow: 1,
                    },
                  }}
                  onClick={() => handleSelect(book)}
                >
                  {/* Cover thumbnail */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 64,
                      height: 88,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {book.coverImageUrl ? (
                      <Box
                        component="img"
                        src={book.coverImageUrl}
                        alt={book.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <MenuBookIcon sx={{ color: 'grey.400', fontSize: 32 }} />
                    )}
                  </Box>

                  {/* Book details */}
                  <Box sx={{ flex: 1, px: 2, py: 1.5, minWidth: 0 }}>
                    {/* Title */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap title={book.title}>
                      {book.title}
                    </Typography>

                    {/* Author */}
                    {book.authors.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <PersonIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {book.authors.join(', ')}
                        </Typography>
                      </Box>
                    )}

                    {/* Publisher + Year */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                      {book.publisher && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BusinessIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {book.publisher}
                          </Typography>
                        </Box>
                      )}
                      {book.publishedYear && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {book.publishedYear}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* ISBNs */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                      {book.isbn13 && (
                        <Chip
                          label={`ISBN-13: ${book.isbn13}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={<FingerprintIcon />}
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      )}
                      {book.isbn10 && (
                        <Chip
                          label={`ISBN-10: ${book.isbn10}`}
                          size="small"
                          color="default"
                          variant="outlined"
                          icon={<FingerprintIcon />}
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      )}
                      {!displayIsbn && (
                        <Chip
                          label="No ISBN"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Import hint */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      pr: 2,
                      color: 'primary.main',
                      display: { xs: 'none', sm: 'flex' },
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Select →
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
