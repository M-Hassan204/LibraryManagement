import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

type FormTextFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'error' | 'helperText'
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
};

/**
 * Reusable Material UI TextField integrated with React Hook Form.
 */
export function FormTextField<TFieldValues extends FieldValues>({
  name,
  control,
  ...rest
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          error={!!error}
          helperText={error?.message}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}
