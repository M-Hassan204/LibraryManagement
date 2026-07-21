import { z } from 'zod';

// Shared validations
const emailValidation = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Schemas
export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    studentId: z.string().optional(),
    department: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const verifyEmailSchema = z.object({
  email: emailValidation,
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
