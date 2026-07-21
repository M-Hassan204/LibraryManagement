// Centralized route path constants.
// Using constants prevents typos and enables IDE refactoring across the entire app.

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_OTP: '/verify-otp',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/not-found',

  // Public catalogue
  BOOKS: '/books',
  BOOK_DETAIL: (id: number | string) => `/books/${id}`,

  // App (authenticated)
  APP: '/app',
  DASHBOARD: '/app/dashboard',

  // Admin — Books
  ADMIN_BOOKS: '/app/books',
  ADMIN_BOOK_CREATE: '/app/books/new',
  ADMIN_BOOK_EDIT: (id: number | string) => `/app/books/${id}/edit`,

  // Admin — Authors
  AUTHORS: '/app/authors',
  AUTHOR_CREATE: '/app/authors/new',
  AUTHOR_EDIT: (id: number | string) => `/app/authors/${id}/edit`,

  // Admin — Categories
  CATEGORIES: '/app/categories',
  CATEGORY_CREATE: '/app/categories/new',
  CATEGORY_EDIT: (id: number | string) => `/app/categories/${id}/edit`,

  // Admin — Borrowings
  BORROWINGS: '/app/borrowings',

  // Student
  MY_BORROWINGS: '/app/my-borrowings',

  // Shared (any authenticated user)
  PROFILE: '/app/profile',
} as const;
