import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, 
  Chip, TextField, InputAdornment, Skeleton, Pagination, MenuItem, Select
} from '@mui/material';
import { Search as SearchIcon, MenuBook as BookIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/features/books/hooks/useBooks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { getImageUrl } from '@/utils/imageUrl';
import { BookStatus } from '@/types/book.types';
import { BookCard } from '@/components/common/BookCard';

export default function BooksPublicPage(): React.ReactElement {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  
  const { data: booksData, isLoading: booksLoading } = useBooks({ 
    pageNumber: page, 
    pageSize: 12,
    searchTerm: search || undefined,
    sortBy: 'createdAt',
    sortDescending: true
  });

  const { data: categoriesData } = useCategories();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case BookStatus.Available: return 'success';
      case BookStatus.Borrowed: return 'warning';
      case BookStatus.Reserved: return 'info';
      case BookStatus.Unavailable: return 'error';
      default: return 'default';
    }
  };

  const filteredBooks = booksData?.items?.filter(b => 
    categoryId === '' || b.categoryId === categoryId
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Library Catalogue
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search books..."
            value={search}
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
            sx={{ minWidth: 250 }}
          />
          
          <Select
            size="small"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value as any); setPage(1); }}
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categoriesData?.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {booksLoading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : filteredBooks && filteredBooks.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {filteredBooks.map((book) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
          
          {booksData?.totalPages && booksData.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={booksData.totalPages} 
                page={page} 
                onChange={(_, value) => setPage(value)} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No books found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or category filter
          </Typography>
        </Box>
      )}
    </Box>
  );
}
