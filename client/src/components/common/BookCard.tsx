import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  Rating,
  Chip
} from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, MenuBook as BookIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/utils/imageUrl';
import { useAuth } from '@/context/AuthContext';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/features/books/hooks/useBooks';
import { BookStatus } from '@/types/book.types';

interface BookCardProps {
  book: any;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { data: favorites } = useFavorites(isAuthenticated);
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const isFavorite = favorites?.some((f: any) => f.id === book.id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteMutation.mutate(book.id);
    } else {
      addFavoriteMutation.mutate(book.id);
    }
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

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/books/${book.id}`)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative', pt: '120%', bgcolor: 'grey.100', width: '100%' }}>
          {book.coverImageUrl ? (
            <CardMedia
              component="img"
              image={getImageUrl(book.coverImageUrl)}
              alt={book.title}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.400' }}>
              <BookIcon sx={{ fontSize: 60 }} />
            </Box>
          )}
          {book.status !== undefined && (
            <Chip 
              label={BookStatus[book.status] || 'Unknown'} 
              color={getStatusColor(book.status) as any}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h2" sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            mb: 1
          }}>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 'auto' }}>
            {book.authorName || book.author?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
            {book.categoryName || book.category?.name}
          </Typography>
          {book.rating !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating value={book.rating} readOnly size="small" precision={0.5} />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
        <Button size="small" variant="outlined" onClick={() => navigate(`/books/${book.id}`)}>
          View Details
        </Button>
        {isAuthenticated && (
          <IconButton 
            size="small" 
            color="error" 
            onClick={handleFavoriteClick}
            disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};
