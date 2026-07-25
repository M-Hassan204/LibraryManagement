import { FormControl, InputLabel, MenuItem, Select, type SelectProps, FormHelperText } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

type FormSelectFieldProps<TFieldValues extends FieldValues> = Omit<
  SelectProps,
  'name' | 'error'
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: { value: string | number; label: string }[];
};

export function FormSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  ...rest
}: FormSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth margin="normal" error={!!error}>
          <InputLabel id={`select-label-${name}`}>{label}</InputLabel>
          <Select
            {...field}
            {...rest}
            labelId={`select-label-${name}`}
            label={label}
            value={field.value !== undefined ? field.value : ''}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
