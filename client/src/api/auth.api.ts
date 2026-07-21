import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type {
  AuthResponseDto,
  GoogleAuthRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  SendOtpRequestDto,
  VerifyEmailRequestDto,
  VerifyOtpRequestDto,
} from '@/types/auth.types';

// All auth endpoints. No business logic here — only HTTP calls.

export const authApi = {
  register(data: RegisterRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    return axiosInstance
      .post<ApiResponse<AuthResponseDto>>('/auth/register', data)
      .then((res) => res.data);
  },

  login(data: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    return axiosInstance
      .post<ApiResponse<AuthResponseDto>>('/auth/login', data)
      .then((res) => res.data);
  },

  refreshToken(
    data: RefreshTokenRequestDto,
  ): Promise<ApiResponse<AuthResponseDto>> {
    return axiosInstance
      .post<ApiResponse<AuthResponseDto>>('/auth/refresh-token', data)
      .then((res) => res.data);
  },

  googleLogin(
    data: GoogleAuthRequestDto,
  ): Promise<ApiResponse<AuthResponseDto>> {
    return axiosInstance
      .post<ApiResponse<AuthResponseDto>>('/auth/google-login', data)
      .then((res) => res.data);
  },

  verifyEmail(data: VerifyEmailRequestDto): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/auth/verify-email', data)
      .then((res) => res.data);
  },

  resendVerificationEmail(email: string): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/auth/resend-verification-email', email)
      .then((res) => res.data);
  },

  sendOtp(data: SendOtpRequestDto): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/auth/send-otp', data)
      .then((res) => res.data);
  },

  verifyOtp(data: VerifyOtpRequestDto): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/auth/verify-otp', data)
      .then((res) => res.data);
  },
};
