import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { getImageUrl } from '@/utils/imageUrl';

export interface ImportedBookData {
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  categories: string[];
  pageCount?: number;
  language?: string;
  coverImageUrl?: string;
}

interface BookSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (bookData: ImportedBookData) => void;
}

export function BookSearchDialog({ open, onClose, onImport }: BookSearchDialogProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportedBookData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 1. Try Google Books API
      const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=10`);
      const googleData = await googleRes.json();

      let books: ImportedBookData[] = [];

      if (googleData.items && googleData.items.length > 0) {
        books = googleData.items.map((item: any) => {
          const vol = item.volumeInfo;
          let isbn10, isbn13;
          if (vol.industryIdentifiers) {
            vol.industryIdentifiers.forEach((id: any) => {
              if (id.type === 'ISBN_10') isbn10 = id.identifier;
              if (id.type === 'ISBN_13') isbn13 = id.identifier;
            });
          }

          let coverUrl = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail;
          if (coverUrl && coverUrl.startsWith('http:')) {
            coverUrl = coverUrl.replace('http:', 'https:');
          }

          return {
            title: vol.title || '',
            subtitle: vol.subtitle,
            authors: vol.authors || [],
            description: vol.description,
            publisher: vol.publisher,
            publishedDate: vol.publishedDate,
            isbn10,
            isbn13,
            categories: vol.categories || [],
            pageCount: vol.pageCount,
            language: vol.language,
            coverImageUrl: coverUrl,
          };
        });
      } else {
        // 2. Fallback to Open Library API
        const olRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`);
        const olData = await olRes.json();
        
        if (olData.docs && olData.docs.length > 0) {
          books = olData.docs.map((doc: any) => {
            const isbn10 = doc.isbn?.find((i: string) => i.length === 10);
            const isbn13 = doc.isbn?.find((i: string) => i.length === 13);
            const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined;

            return {
              title: doc.title || '',
              authors: doc.author_name || [],
              publishedDate: doc.first_publish_year ? doc.first_publish_year.toString() : undefined,
              isbn10,
              isbn13,
              categories: doc.subject || [],
              pageCount: doc.number_of_pages_median,
              language: doc.language?.[0],
              coverImageUrl: coverUrl,
            };
          });
        }
      }

      setResults(books);
      if (books.length === 0) {
        setError('No results found.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
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
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Enter book title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading || !query.trim()}>
            <SearchIcon />
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {!loading && results.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {results.map((book, idx) => (
              <ListItem
                key={idx}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => {
                  onImport(book);
                  onClose();
                }}
              >
                <ListItemAvatar>
                  <Avatar src={getImageUrl(book.coverImageUrl)} variant="rounded" sx={{ width: 40, height: 60 }}>
                    <ImageSearchIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={book.title}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {book.authors.join(', ')}
                      </Typography>
                      {book.publishedDate ? ` — ${book.publishedDate}` : ''}
                      <br />
                      ISBN: {book.isbn13 || book.isbn10 || 'N/A'}
                    </React.Fragment>
                  }
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
