import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Grid, 
  TextField, InputAdornment, Skeleton, Pagination, MenuItem, Select, Button
} from '@mui/material';
import { Search as SearchIcon, Favorite as FavoriteIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/features/books/hooks/useBooks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BookCard } from '@/components/common/BookCard';
import { ROUTES } from '@/constants/routes';

export default function FavoritesPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const pageSize = 12;
  
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(isAuthenticated);
  const { data: categoriesData } = useCategories();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const filteredFavorites = useMemo(() => {
    if (!favorites) return [];
    
    return favorites.filter((book: any) => {
      const matchesCategory = categoryId === '' || book.categoryId === categoryId;
      const matchesSearch = search === '' || 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.authorName || '').toLowerCase().includes(search.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [favorites, categoryId, search]);

  const totalPages = Math.ceil(filteredFavorites.length / pageSize);
  const paginatedFavorites = filteredFavorites.slice((page - 1) * pageSize, page * pageSize);

  // If there are literally no favorites at all (not even unfiltered)
  if (!favoritesLoading && (!favorites || favorites.length === 0)) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            ❤️ My Favorite Books
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You have 0 favorite books.
        </Typography>

        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '40vh',
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 6,
            boxShadow: 1
          }}
        >
          <FavoriteIcon color="disabled" sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            ❤️ No favorite books yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            Browse books and start building your personal library.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(ROUTES.BOOKS)}
            sx={{ borderRadius: '24px', px: 4 }}
          >
            Browse Books
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ❤️ My Favorite Books
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        You have {favorites?.length || 0} favorite books.
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'flex-end', alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
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
            {categoriesData?.map((cat: any) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {favoritesLoading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : paginatedFavorites.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedFavorites.map((book: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(_, value) => setPage(value)} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No books found matching your filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or category filter
          </Typography>
        </Box>
      )}
    </Box>
  );
}
