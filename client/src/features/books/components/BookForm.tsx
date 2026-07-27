import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Card, Typography, Grid, CircularProgress } from '@mui/material';
import { FormTextField } from '@/components/form/FormTextField';
import { FormSelectField } from '@/components/form/FormSelectField';
import { Autocomplete, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useAuthors } from '@/features/authors/hooks/useAuthors';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BookStatus } from '@/types/book.types';
import { LoadingButton } from '@/components/common/LoadingButton';
import { BookSearchDialog, type ImportedBookData } from './BookSearchDialog';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { getImageUrl } from '@/utils/imageUrl';
import { useBookMetadata } from '../hooks/useBooks';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  description: z.string().optional(),
  publishedYear: z.coerce.number().int().min(1000).max(9999),
  categoryId: z.union([z.coerce.number().int().positive(), z.string().min(1, 'Category is required')]),
  authorId: z.union([z.coerce.number().int().positive(), z.string().min(1, 'Author is required')]),
  status: z.nativeEnum(BookStatus).optional(),
  coverImageUrl: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string().optional(),
  pages: z.coerce.number().int().positive().optional().or(z.literal('')),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookFormProps {
  initialValues?: Partial<BookFormValues>;
  onSubmit: (data: BookFormValues, file: File | null) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function BookForm({ initialValues, onSubmit, isLoading, isEdit = false }: BookFormProps) {
  const { data: authors } = useAuthors();
  const { data: categories } = useCategories();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, setValue, getValues } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema) as any,
    defaultValues: {
      title: initialValues?.title || '',
      isbn: initialValues?.isbn || '',
      description: initialValues?.description || '',
      publishedYear: initialValues?.publishedYear || new Date().getFullYear(),
      categoryId: initialValues?.categoryId || 0,
      authorId: initialValues?.authorId || 0,
      status: initialValues?.status || BookStatus.Available,
      coverImageUrl: initialValues?.coverImageUrl || '',
      publisher: initialValues?.publisher || '',
      language: initialValues?.language || '',
      pages: initialValues?.pages || ('' as any),
    },
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string | null>(initialValues?.coverImageUrl || null);

  const watchIsbn = useWatch({ control, name: 'isbn' });
  const watchTitle = useWatch({ control, name: 'title' });
  const watchAuthorId = useWatch({ control, name: 'authorId' });

  const debouncedIsbn = useDebounce(watchIsbn, 800);
  const debouncedTitle = useDebounce(watchTitle, 800);
  const debouncedAuthorId = useDebounce(watchAuthorId, 800);

  const authorName = typeof debouncedAuthorId === 'number' 
    ? authors?.find(a => a.id === debouncedAuthorId)?.name || ''
    : typeof debouncedAuthorId === 'string' ? debouncedAuthorId : '';

  const shouldFetchMetadata = !isEdit && Boolean(
    (debouncedIsbn && debouncedIsbn.length >= 10) || 
    (debouncedTitle && debouncedTitle.length > 2 && authorName)
  );

  const { data: metadata, isLoading: isMetadataLoading, error: metadataError, refetch: refetchMetadata } = useBookMetadata(
    { 
      isbn: debouncedIsbn && debouncedIsbn.length >= 10 ? debouncedIsbn : undefined, 
      title: (!debouncedIsbn || debouncedIsbn.length < 10) ? debouncedTitle : undefined, 
      author: (!debouncedIsbn || debouncedIsbn.length < 10) ? authorName : undefined 
    },
    shouldFetchMetadata
  );

  useEffect(() => {
    if (metadata && !isEdit) {
      if (!getValues('description') && metadata.description) setValue('description', metadata.description, { shouldValidate: true });
      if (!getValues('publisher') && metadata.publisher) setValue('publisher', metadata.publisher, { shouldValidate: true });
      if (!getValues('language') && metadata.language) setValue('language', metadata.language, { shouldValidate: true });
      if (!getValues('pages') && metadata.pages) setValue('pages', metadata.pages, { shouldValidate: true });
      
      const currentYear = new Date().getFullYear();
      if ((!getValues('publishedYear') || getValues('publishedYear') === currentYear) && metadata.publishedYear) {
        setValue('publishedYear', metadata.publishedYear, { shouldValidate: true });
      }

      if (!getValues('coverImageUrl') && metadata.coverImageUrl && !selectedFile) {
        setValue('coverImageUrl', metadata.coverImageUrl, { shouldValidate: true });
        setPreviewCoverUrl(metadata.coverImageUrl);
      }
      
      if (!getValues('title') && metadata.title) {
         setValue('title', metadata.title, { shouldValidate: true });
      }

      if (!getValues('isbn') && metadata.isbn13) {
         setValue('isbn', metadata.isbn13, { shouldValidate: true });
      } else if (!getValues('isbn') && metadata.isbn10) {
         setValue('isbn', metadata.isbn10, { shouldValidate: true });
      }
    }
  }, [metadata, isEdit, setValue, getValues, selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setPreviewCoverUrl(URL.createObjectURL(event.target.files[0]));
      setValue('coverImageUrl', '', { shouldValidate: true });
    }
  };

  const handleImport = (bookData: ImportedBookData) => {
    setValue('title', bookData.title, { shouldValidate: true });
    setValue('isbn', bookData.isbn13 || bookData.isbn10 || '', { shouldValidate: true });
    
    if (bookData.publishedDate) {
      const year = parseInt(bookData.publishedDate.substring(0, 4));
      if (!isNaN(year)) {
        setValue('publishedYear', year, { shouldValidate: true });
      }
    }

    if (bookData.coverImageUrl) {
      setValue('coverImageUrl', bookData.coverImageUrl, { shouldValidate: true });
      setPreviewCoverUrl(bookData.coverImageUrl);
      setSelectedFile(null);
    }
    
    if (bookData.publisher) setValue('publisher', bookData.publisher, { shouldValidate: true });
    if (bookData.language) setValue('language', bookData.language, { shouldValidate: true });
    if (bookData.pageCount) setValue('pages', bookData.pageCount, { shouldValidate: true });

    let descLines = [];
    if (bookData.subtitle) descLines.push(`Subtitle: ${bookData.subtitle}`);
    if (bookData.categories && bookData.categories.length > 0) descLines.push(`External Categories: ${bookData.categories.join(', ')}`);
    if (descLines.length > 0) descLines.push('');
    if (bookData.description) descLines.push(bookData.description);
    
    setValue('description', descLines.join('\n').trim(), { shouldValidate: true });

    if (bookData.authors && bookData.authors.length > 0 && authors) {
      const joinedAuthors = bookData.authors.join(', ');
      const matched = authors.find(a => a.name.toLowerCase() === joinedAuthors.toLowerCase() || a.name.toLowerCase().includes(joinedAuthors.toLowerCase()) || joinedAuthors.toLowerCase().includes(a.name.toLowerCase()));
      if (matched) {
        setValue('authorId', matched.id, { shouldValidate: true });
      } else {
        setValue('authorId', joinedAuthors as any, { shouldValidate: true });
      }
    }

    if (bookData.categories && bookData.categories.length > 0 && categories) {
      const mainCat = bookData.categories[0];
      const matched = categories.find(c => c.name.toLowerCase() === mainCat.toLowerCase() || mainCat.toLowerCase().includes(c.name.toLowerCase()));
      if (matched) {
        setValue('categoryId', matched.id, { shouldValidate: true });
      } else {
        setValue('categoryId', mainCat as any, { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = async (data: BookFormValues) => {
    // If pages is empty string, make it undefined
    const submitData = { ...data, pages: data.pages === '' ? undefined : data.pages } as any;
    await onSubmit(submitData, selectedFile);
  };

  return (
    <Card sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import From Internet
          </Button>
        </Box>
        
        {!isEdit && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Book Information (Auto Fetch)
                  </Typography>
                  <Button size="small" onClick={() => refetchMetadata()} disabled={!shouldFetchMetadata || isMetadataLoading}>
                    Refresh
                  </Button>
                </Box>
                {isMetadataLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Searching Google Books...</Typography>
                  </Box>
                ) : metadataError ? (
                  <Typography color="error" variant="body2">
                    No metadata was found for this book.
                  </Typography>
                ) : metadata ? (
                  <Grid container spacing={2}>
                    {metadata.coverImageUrl && (
                      <Grid size={{ xs: 12, sm: 3 }}>
                         <Box
                          component="img"
                          src={getImageUrl(metadata.coverImageUrl)}
                          alt="Retrieved Cover"
                          sx={{ width: '100%', borderRadius: 1 }}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: metadata.coverImageUrl ? 9 : 12 }}>
                      <Typography variant="subtitle1"><strong>{metadata.title}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">By {metadata.authors?.join(', ')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metadata.publisher} {metadata.publishedYear ? `(${metadata.publishedYear})` : ''}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, maxHeight: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {metadata.description}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Enter ISBN or Title + Author to automatically fetch metadata.
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="isbn" control={control} label="ISBN" required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="title" control={control} label="Title" required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {authors && (
              <Controller
                name="authorId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={authors}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      if (option && typeof option === 'object' && option.name) return option.name;
                      return '';
                    }}
                    value={
                      typeof field.value === 'number'
                        ? authors.find((a) => a.id === field.value) || null
                        : field.value || ''
                    }
                    onChange={(_, data) => {
                      if (!data) field.onChange('');
                      else if (typeof data === 'string') field.onChange(data);
                      else field.onChange(data.id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Author"
                        required
                        error={!!error}
                        helperText={error?.message}
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {categories && (
              <Controller
                name="categoryId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={categories}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      if (option && typeof option === 'object' && option.name) return option.name;
                      return '';
                    }}
                    value={
                      typeof field.value === 'number'
                        ? categories.find((c) => c.id === field.value) || null
                        : field.value || ''
                    }
                    onChange={(_, data) => {
                      if (!data) field.onChange('');
                      else if (typeof data === 'string') field.onChange(data);
                      else field.onChange(data.id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        required
                        error={!!error}
                        helperText={error?.message}
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="publishedYear"
              control={control}
              label="Published Year"
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="publisher" control={control} label="Publisher" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="language" control={control} label="Language" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="pages" control={control} label="Pages" type="number" />
          </Grid>
          {isEdit && (
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelectField
                name="status"
                control={control}
                label="Status"
                options={[
                  { value: BookStatus.Available, label: 'Available' },
                  { value: BookStatus.Borrowed, label: 'Borrowed' },
                  { value: BookStatus.Unavailable, label: 'Unavailable' },
                ]}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="description"
              control={control}
              label="Description"
              multiline
              rows={4}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cover Image (Optional)
            </Typography>
            {previewCoverUrl && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={getImageUrl(previewCoverUrl)}
                  alt="Cover Preview"
                  style={{ maxHeight: 200, borderRadius: 4, objectFit: 'contain' }}
                />
              </Box>
            )}
            <input
              accept="image/jpeg, image/png, image/gif"
              style={{ display: 'none' }}
              id="cover-image-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="cover-image-upload">
              <Button variant="outlined" component="span">
                {selectedFile ? selectedFile.name : 'Upload Cover Image'}
              </Button>
            </label>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
          >
            {isEdit ? 'Update Book' : 'Create Book'}
          </LoadingButton>
        </Box>
      </Box>

      <BookSearchDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />
    </Card>
  );
}
