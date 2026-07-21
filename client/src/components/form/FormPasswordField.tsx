import { useState, type ReactElement } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type FormPasswordFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'error' | 'helperText' | 'type'
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
};

/**
 * Reusable Material UI TextField for passwords.
 * Integrates with React Hook Form and provides a show/hide toggle.
 */
export function FormPasswordField<TFieldValues extends FieldValues>({
  name,
  control,
  ...rest
}: FormPasswordFieldProps<TFieldValues>): ReactElement {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...(rest as any)}
          type={showPassword ? 'text' : 'password'}
          error={!!error}
          helperText={error?.message}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
