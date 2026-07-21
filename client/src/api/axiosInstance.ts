import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { storageService } from '@/services/storage.service';
import type { ApiResponse } from '@/types/api.types';
import type { AuthResponseDto, RefreshTokenRequestDto } from '@/types/auth.types';

// ─── Axios instance ───────────────────────────────────────────────────────────
//
// A single, shared Axios instance used by every API function in the application.
// It is the only place where:
//   1. The base URL is configured.
//   2. Auth headers are attached.
//   3. Token refresh is handled.
//   4. 401 / 403 responses are intercepted globally.
//
// Nothing in the application should import axios directly — only this instance.

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attaches the JWT access token to every outgoing request.

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = storageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handles 401 (expired token) by attempting a silent refresh.
// Handles 403 (forbidden) by redirecting to the unauthorized page.

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Queue of requests that arrived while refresh was in progress
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 403 Forbidden ──────────────────────────────────────────────────────
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
      return Promise.reject(error);
    }

    // ── 401 Unauthorized — attempt token refresh ───────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storageService.getRefreshToken();
      const accessToken = storageService.getAccessToken();

      // If we have no refresh token, go to login immediately
      if (!refreshToken || !accessToken) {
        storageService.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const payload: RefreshTokenRequestDto = {
          token: accessToken,
          refreshToken,
        };

        const { data } = await axios.post<ApiResponse<AuthResponseDto>>(
          `${import.meta.env.VITE_API_BASE_URL as string}/auth/refresh-token`,
          payload,
        );

        if (!data.success || !data.data) {
          throw new Error('Refresh token response was not successful.');
        }

        const newToken = data.data.token;
        const newRefreshToken = data.data.refreshToken;

        storageService.setAccessToken(newToken);
        storageService.setRefreshToken(newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storageService.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
