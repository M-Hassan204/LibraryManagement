import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Card, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { FormTextField } from '@/components/form/FormTextField';
import { FormSelectField } from '@/components/form/FormSelectField';
import { Autocomplete, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useAuthors, useCreateAuthor } from '@/features/authors/hooks/useAuthors';
import { useCategories, useCreateCategory } from '@/features/categories/hooks/useCategories';
import { BookStatus } from '@/types/book.types';
import { LoadingButton } from '@/components/common/LoadingButton';
import { BookSearchDialog, type ImportedBookData } from './BookSearchDialog';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  categoryId: z.union([z.coerce.number().int().positive('Category is required'), z.string().min(1, 'Category is required')]),
  authorId: z.union([z.coerce.number().int().positive('Author is required'), z.string().min(1, 'Author is required')]),
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
  const createAuthorMutation = useCreateAuthor();
  const createCategoryMutation = useCreateCategory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, setValue, getValues, trigger } = useForm<BookFormValues>({
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
    values: initialValues ? {
      title: initialValues.title || '',
      isbn: initialValues.isbn || '',
      description: initialValues.description || '',
      publishedYear: initialValues.publishedYear || new Date().getFullYear(),
      categoryId: initialValues.categoryId || 0,
      authorId: initialValues.authorId || 0,
      status: initialValues.status || BookStatus.Available,
      coverImageUrl: initialValues.coverImageUrl || '',
      publisher: initialValues.publisher || '',
      language: initialValues.language || '',
      pages: initialValues.pages || ('' as any),
    } : undefined,
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string | null>(initialValues?.coverImageUrl || null);
  // Track whether user has successfully imported a book via the dialog
  const [importedBook, setImportedBook] = useState<ImportedBookData | null>(null);

  const watchIsbn = useWatch({ control, name: 'isbn' });
  const watchTitle = useWatch({ control, name: 'title' });
  const watchAuthorId = useWatch({ control, name: 'authorId' });

  const debouncedIsbn = useDebounce(watchIsbn, 800);
  const debouncedTitle = useDebounce(watchTitle, 800);
  const debouncedAuthorId = useDebounce(watchAuthorId, 800);

  const authorName = typeof debouncedAuthorId === 'number' 
    ? authors?.find(a => a.id === debouncedAuthorId)?.name || ''
    : typeof debouncedAuthorId === 'string' ? debouncedAuthorId : '';

  const shouldFetchMetadata = !isEdit && !importedBook && Boolean(
    (debouncedIsbn && debouncedIsbn.length >= 10) || 
    (debouncedTitle && debouncedTitle.length > 2 && authorName)
  );

  const { data: metadata, isLoading: isMetadataLoading, error: metadataError } = useBookMetadata(
    { 
      isbn: debouncedIsbn && debouncedIsbn.length >= 10 ? debouncedIsbn : undefined, 
      title: (!debouncedIsbn || debouncedIsbn.length < 10) ? debouncedTitle : undefined, 
      author: (!debouncedIsbn || debouncedIsbn.length < 10) ? authorName : undefined 
    },
    shouldFetchMetadata
  );

  // Auto-fill form fields from auto-fetched metadata (only empty fields)
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

      // Only set ISBN from metadata if the field is empty (user hasn't typed one)
      const currentIsbn = getValues('isbn');
      if (!currentIsbn && metadata.isbn13) {
         setValue('isbn', metadata.isbn13, { shouldValidate: true });
         void trigger('isbn');
      } else if (!currentIsbn && metadata.isbn10) {
         setValue('isbn', metadata.isbn10, { shouldValidate: true });
         void trigger('isbn');
      }
    }
  }, [metadata, isEdit, setValue, getValues, selectedFile, trigger]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setPreviewCoverUrl(URL.createObjectURL(event.target.files[0]));
      setValue('coverImageUrl', '', { shouldValidate: true });
    }
  };

  const handleImport = async (bookData: ImportedBookData) => {
    // Mark that user has imported a book — disables auto-fetch error display
    setImportedBook(bookData);

    setValue('title', bookData.title, { shouldValidate: true });

    // Set ISBN — prefer ISBN-13, fall back to ISBN-10
    const isbnValue = bookData.isbn13 || bookData.isbn10 || '';
    setValue('isbn', isbnValue, { shouldValidate: true });
    // Explicitly trigger ISBN validation to clear any stale error
    void trigger('isbn');
    
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

    // Build description from subtitle + external categories + main description
    const descLines: string[] = [];
    if (bookData.subtitle) descLines.push(`Subtitle: ${bookData.subtitle}`);
    if (bookData.categories && bookData.categories.length > 0) descLines.push(`External Categories: ${bookData.categories.join(', ')}`);
    if (descLines.length > 0) descLines.push('');
    if (bookData.description) descLines.push(bookData.description);
    setValue('description', descLines.join('\n').trim(), { shouldValidate: true });

    // Try to match author against existing authors
    const authorName = bookData.authors?.[0]?.trim() ?? "";
    console.log("Imported author:", authorName);
    
    if (authorName) {
      // Helper to normalize author names (e.g., "Robert C. Martin" -> ["robert", "c", "martin"])
      const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      const importedWords = normalizeName(authorName);
      
      let existingAuthor = null;
      if (importedWords.length > 0) {
        existingAuthor = authors?.find(a => {
          const existingWords = normalizeName(a.name);
          if (existingWords.length === 0) return false;
          
          if (importedWords.length >= 2 && existingWords.length >= 2) {
             return importedWords[0] === existingWords[0] && 
                    importedWords[importedWords.length - 1] === existingWords[existingWords.length - 1];
          }
          
          const normalizedImported = authorName.toLowerCase();
          const normalizedExisting = a.name.trim().toLowerCase();
          return normalizedExisting === normalizedImported || 
                 normalizedExisting.includes(normalizedImported) ||
                 normalizedImported.includes(normalizedExisting);
        }) || null;
      }
      
      console.log("Author exists:", existingAuthor);

      if (existingAuthor) {
        setValue('authorId', existingAuthor.id, { shouldValidate: true });
        console.log("Assigned authorId:", existingAuthor.id);
      } else {
        try {
          const payload = { name: authorName, biography: '' };
          const createdAuthor = await createAuthorMutation.mutateAsync(payload);
          console.log("Created author:", createdAuthor);
          setValue("authorId", createdAuthor.id, { shouldValidate: true });
          console.log("Assigned authorId:", createdAuthor.id);
        } catch (e) {
          console.error('[DEBUG] Failed to create author automatically:', e);
          setValue('authorId', authorName as any, { shouldValidate: true });
        }
      }
    } else {
      setValue('authorId', '' as any, { shouldValidate: true });
    }

    // Try to match category against existing categories
    if (bookData.categories && bookData.categories.length > 0) {
      const mainCat = bookData.categories[0];
      const matchedCat = categories?.find(c => 
        c.name.toLowerCase() === mainCat.toLowerCase() ||
        c.name.toLowerCase().includes(mainCat.toLowerCase()) ||
        mainCat.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (matchedCat) {
        setValue('categoryId', matchedCat.id, { shouldValidate: true });
        console.log('[DEBUG] Mapped existing categoryId:', matchedCat.id);
      } else {
        try {
          const newCat = await createCategoryMutation.mutateAsync({ name: mainCat });
          setValue('categoryId', newCat.id, { shouldValidate: true });
          console.log('[DEBUG] Mapped new categoryId:', newCat.id);
        } catch (e) {
          console.error('[DEBUG] Failed to create category:', e);
          setValue('categoryId', mainCat as any, { shouldValidate: true });
        }
      }
    }

    const finalIsbn = bookData.isbn13 || bookData.isbn10 || '';
    console.log('[DEBUG] Final mapped values:', {
      isbn: finalIsbn,
      authors: bookData.authors,
      categories: bookData.categories,
    });

    // Run full validation after all fields are set
    void trigger();
  };



  const handleFormSubmit = async (data: BookFormValues) => {
    // If pages is empty string, make it undefined
    const submitData = { ...data, pages: data.pages === '' ? undefined : data.pages } as any;
    await onSubmit(submitData, selectedFile);
  };

  // Determine what to show in the metadata preview panel
  const showImportedSuccess = importedBook !== null;
  const showMetadataSuccess = !importedBook && metadata;
  const showMetadataError = !importedBook && !metadata && metadataError;
  const showMetadataIdle = !importedBook && !metadata && !metadataError && !isMetadataLoading;

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
                </Box>

                {isMetadataLoading && !importedBook ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Searching Google Books...</Typography>
                  </Box>
                ) : showImportedSuccess ? (
                  // User imported from dialog — always show success state
                  <Grid container spacing={2}>
                    {importedBook.coverImageUrl && (
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Box
                          component="img"
                          src={getImageUrl(importedBook.coverImageUrl)}
                          alt="Imported Cover"
                          sx={{ width: '100%', borderRadius: 1 }}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: importedBook.coverImageUrl ? 9 : 12 }}>
                      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 1 }}>
                        Book imported successfully
                      </Alert>
                      <Typography variant="subtitle1"><strong>{importedBook.title}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">By {importedBook.authors.join(', ')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {importedBook.publisher} {importedBook.publishedDate ? `(${importedBook.publishedDate.substring(0, 4)})` : ''}
                      </Typography>
                      {(importedBook.isbn13 || importedBook.isbn10) && (
                        <Typography variant="body2" color="text.secondary">
                          ISBN: {importedBook.isbn13 || importedBook.isbn10}
                        </Typography>
                      )}
                      <Button size="small" sx={{ mt: 1 }} onClick={() => setImportedBook(null)}>
                        Clear import
                      </Button>
                    </Grid>
                  </Grid>
                ) : showMetadataSuccess ? (
                  // Auto-fetch found metadata
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
                ) : showMetadataError ? (
                  // Auto-fetch genuinely returned nothing
                  <Typography color="error" variant="body2">
                    No metadata was found for this book.
                  </Typography>
                ) : showMetadataIdle ? (
                  // Nothing entered yet
                  <Typography variant="body2" color="text.secondary">
                    Enter ISBN or Title + Author to automatically fetch metadata.
                  </Typography>
                ) : null}
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
                      (() => {
                        const val = field.value;
                        if (!val) return null;
                        const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
                        if (!isNaN(numVal) && authors) {
                          const found = authors.find((a) => a.id === numVal);
                          if (found) return found;
                          return null;
                        }
                        return (typeof val === 'number' ? val.toString() : val) as any;
                      })()
                    }
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      if (typeof option === 'string') return option === value;
                      if (typeof option === 'object' && typeof value === 'object') return option.id === value.id;
                      return false;
                    }}
                    renderOption={(props, option) => {
                      // Autocomplete provides a default key in props, but to avoid 
                      // duplicate key warnings when two authors have the same name,
                      // we extract it and force our own unique key using option.id
                      const { key, ...optionProps } = props as any;
                      const uniqueKey = typeof option === 'string' ? option : option.id;
                      return (
                        <li key={uniqueKey} {...optionProps}>
                          {typeof option === 'string' ? option : option.name}
                        </li>
                      );
                    }}
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
                      (() => {
                        const val = field.value;
                        if (!val) return null;
                        const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
                        if (!isNaN(numVal) && categories) {
                          return categories.find((c) => c.id === numVal) || null;
                        }
                        return (typeof val === 'number' ? val.toString() : val) as any;
                      })()
                    }
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      if (typeof option === 'string') return option === value;
                      if (typeof option === 'object' && typeof value === 'object') return option.id === value.id;
                      return false;
                    }}
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
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/app/dashboard'}
            disabled={isLoading}
          >
            Cancel
          </Button>
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
