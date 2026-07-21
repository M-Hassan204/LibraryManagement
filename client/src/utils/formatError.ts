import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api.types';

/**
 * Extracts a user-friendly error message from any error, specifically handling
 * Axios errors containing our standard backend ApiResponse format.
 */
export function formatError(error: unknown): string {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiResponse<unknown>;
    
    // If the backend sent an array of validation errors, join them
    if (data.errors && data.errors.length > 0) {
      return data.errors.join(' ');
    }
    
    // If the backend sent a generic message
    if (data.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
