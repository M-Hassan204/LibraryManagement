import { lazy, Suspense, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AdminRoute, ProtectedRoute, PublicRoute } from './guards';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Every page is lazy-loaded for code splitting.
// Bundles are split per-page, keeping initial load fast.

// Public auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const VerifyOtpPage = lazy(() => import('@/features/auth/pages/VerifyOtpPage'));

// Public catalogue
const BooksPublicPage = lazy(() => import('@/features/books/pages/BooksPublicPage'));
const BookDetailPage = lazy(() => import('@/features/books/pages/BookDetailPage'));

// App shell layout (authenticated wrapper)
const AppShell = lazy(() => import('@/components/layout/AppShell'));

// Admin pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AdminBooksPage = lazy(() => import('@/features/books/pages/AdminBooksPage'));
const CreateBookPage = lazy(() => import('@/features/books/pages/CreateBookPage'));
const EditBookPage = lazy(() => import('@/features/books/pages/EditBookPage'));
const AuthorsPage = lazy(() => import('@/features/authors/pages/AuthorsPage'));
const CreateAuthorPage = lazy(() => import('@/features/authors/pages/CreateAuthorPage'));
const EditAuthorPage = lazy(() => import('@/features/authors/pages/EditAuthorPage'));
const CategoriesPage = lazy(() => import('@/features/categories/pages/CategoriesPage'));
const CreateCategoryPage = lazy(() => import('@/features/categories/pages/CreateCategoryPage'));
const EditCategoryPage = lazy(() => import('@/features/categories/pages/EditCategoryPage'));
const AllBorrowingsPage = lazy(() => import('@/features/borrowings/pages/AllBorrowingsPage'));

// Authenticated (any role) pages
const MyBorrowingsPage = lazy(() => import('@/features/borrowings/pages/MyBorrowingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

// Error pages
const UnauthorizedPage = lazy(() => import('@/features/errors/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));

// ─── Suspense fallback ────────────────────────────────────────────────────────
// A minimal, centered loading indicator shown while lazy chunks are loading.
// The full-page skeleton is reserved for data loading states inside pages.
const PageLoader = (): ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}
  />
);

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // ── Root redirect ─────────────────────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to={ROUTES.BOOKS} replace />,
  },

  // ── Public auth routes ────────────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <RegisterPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.VERIFY_OTP,
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyOtpPage />
      </Suspense>
    ),
  },

  // ── Public catalogue routes ───────────────────────────────────────────────
  {
    path: ROUTES.BOOKS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <BooksPublicPage />
      </Suspense>
    ),
  },
  {
    path: '/books/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <BookDetailPage />
      </Suspense>
    ),
  },

  // ── Authenticated app routes (nested under AppShell layout) ───────────────
  {
    path: ROUTES.APP,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AppShell />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      // Default /app redirect
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },

      // Admin-only routes
      {
        path: ROUTES.DASHBOARD,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_BOOKS,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminBooksPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_BOOK_CREATE,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateBookPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: '/app/books/:id/edit',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <EditBookPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.AUTHORS,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <AuthorsPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.AUTHOR_CREATE,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateAuthorPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: '/app/authors/:id/edit',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <EditAuthorPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.CATEGORIES,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <CategoriesPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.CATEGORY_CREATE,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateCategoryPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: '/app/categories/:id/edit',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <EditCategoryPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.BORROWINGS,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <AllBorrowingsPage />
            </Suspense>
          </AdminRoute>
        ),
      },

      // Any authenticated user routes
      {
        path: ROUTES.MY_BORROWINGS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <MyBorrowingsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // ── Error pages ───────────────────────────────────────────────────────────
  {
    path: ROUTES.UNAUTHORIZED,
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.NOT_FOUND,
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.NOT_FOUND} replace />,
  },
]);
