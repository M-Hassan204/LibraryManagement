import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Card, Typography, Grid } from '@mui/material';
import { FormTextField } from '@/components/form/FormTextField';
import { FormSelectField } from '@/components/form/FormSelectField';
import { useAuthors } from '@/features/authors/hooks/useAuthors';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BookStatus } from '@/types/book.types';
import { LoadingButton } from '@/components/common/LoadingButton';
import { BookSearchDialog, type ImportedBookData } from './BookSearchDialog';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { getImageUrl } from '@/utils/imageUrl';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  description: z.string().optional(),
  publishedYear: z.coerce.number().int().min(1000).max(9999),
  categoryId: z.coerce.number().int().positive('Category is required'),
  authorId: z.coerce.number().int().positive('Author is required'),
  status: z.nativeEnum(BookStatus).optional(),
  coverImageUrl: z.string().optional(),
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

  const { control, handleSubmit, setValue } = useForm<BookFormValues>({
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
    },
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string | null>(initialValues?.coverImageUrl || null);

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

    let descLines = [];
    if (bookData.subtitle) descLines.push(`Subtitle: ${bookData.subtitle}`);
    if (bookData.publisher) descLines.push(`Publisher: ${bookData.publisher}`);
    if (bookData.pageCount) descLines.push(`Pages: ${bookData.pageCount}`);
    if (bookData.language) descLines.push(`Language: ${bookData.language}`);
    if (bookData.categories && bookData.categories.length > 0) descLines.push(`External Categories: ${bookData.categories.join(', ')}`);
    if (descLines.length > 0) descLines.push('');
    if (bookData.description) descLines.push(bookData.description);
    
    setValue('description', descLines.join('\n').trim(), { shouldValidate: true });

    if (bookData.authors && bookData.authors.length > 0 && authors) {
      const mainAuthor = bookData.authors[0].toLowerCase();
      const matched = authors.find(a => a.name.toLowerCase().includes(mainAuthor) || mainAuthor.includes(a.name.toLowerCase()));
      if (matched) setValue('authorId', matched.id, { shouldValidate: true });
    }

    if (bookData.categories && bookData.categories.length > 0 && categories) {
      const mainCat = bookData.categories[0].toLowerCase();
      const matched = categories.find(c => c.name.toLowerCase().includes(mainCat) || mainCat.includes(c.name.toLowerCase()));
      if (matched) setValue('categoryId', matched.id, { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (data: BookFormValues) => {
    await onSubmit(data, selectedFile);
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
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="title" control={control} label="Title" required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="isbn" control={control} label="ISBN" required />
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
            {categories && (
              <FormSelectField
                name="categoryId"
                control={control}
                label="Category"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                required
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {authors && (
              <FormSelectField
                name="authorId"
                control={control}
                label="Author"
                options={authors.map((a) => ({ value: a.id, label: a.name }))}
                required
              />
            )}
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
