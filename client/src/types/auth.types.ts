// Mirrors: LibraryManagement.Application.DTOs.Auth.*

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  requiresTwoFactor: boolean;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId?: string;
  department?: string;
}

export interface RefreshTokenRequestDto {
  token: string;
  refreshToken: string;
}

export interface GoogleAuthRequestDto {
  idToken: string;
}

export interface VerifyEmailRequestDto {
  email: string;
  token: string;
}

export interface SendOtpRequestDto {
  email: string;
}

export interface VerifyOtpRequestDto {
  email: string;
  otp: string;
}

// Internal frontend representation of an authenticated user (derived from AuthResponseDto)
export interface AuthenticatedUser {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
}
