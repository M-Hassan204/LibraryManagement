import { lazy, Suspense, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { APP_ROLES } from '@/constants/roles';
import { AdminRoute, ProtectedRoute, PublicRoute, LibrarianRoute } from './guards';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Public auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const VerifyOtpPage = lazy(() => import('@/features/auth/pages/VerifyOtpPage'));

// Public catalogue & new pages
const BooksPublicPage = lazy(() => import('@/features/books/pages/BooksPublicPage'));
const BookDetailPage = lazy(() => import('@/features/books/pages/BookDetailPage'));
const BookReaderPage = lazy(() => import('@/features/books/pages/BookReaderPage'));
const AboutPage = lazy(() => import('@/features/public/pages/AboutPage'));
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage'));

// Shared Layout wrapper
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));

// Shared Home (Normal Users and Guests)
const HomePage = lazy(() => import('@/features/dashboard/pages/HomePage'));

// Admin & Librarian pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AdminSubscriptionsPage = lazy(() => import('@/features/subscriptions/pages/AdminSubscriptionsPage'));
const AdminBooksPage = lazy(() => import('@/features/books/pages/AdminBooksPage'));
const CreateBookPage = lazy(() => import('@/features/books/pages/CreateBookPage'));
const EditBookPage = lazy(() => import('@/features/books/pages/EditBookPage'));
const AuthorsPage = lazy(() => import('@/features/authors/pages/AuthorsPage'));
const AuthorDetailPage = lazy(() => import('@/features/authors/pages/AuthorDetailPage'));
const CreateAuthorPage = lazy(() => import('@/features/authors/pages/CreateAuthorPage'));
const EditAuthorPage = lazy(() => import('@/features/authors/pages/EditAuthorPage'));
const CategoriesPage = lazy(() => import('@/features/categories/pages/CategoriesPage'));
const CategoryDetailPage = lazy(() => import('@/features/categories/pages/CategoryDetailPage'));
const CreateCategoryPage = lazy(() => import('@/features/categories/pages/CreateCategoryPage'));
const EditCategoryPage = lazy(() => import('@/features/categories/pages/EditCategoryPage'));
const AllBorrowingsPage = lazy(() => import('@/features/borrowings/pages/AllBorrowingsPage'));
const BorrowingDetailPage = lazy(() => import('@/features/borrowings/pages/BorrowingDetailPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const MembersPage = lazy(() => import('@/features/users/pages/MembersPage'));
const MemberDetailPage = lazy(() => import('@/features/users/pages/MemberDetailPage'));

// Authenticated (any role) pages
const FavoritesPage = lazy(() => import('@/features/favorites/pages/FavoritesPage'));
const MyBorrowingsPage = lazy(() => import('@/features/borrowings/pages/MyBorrowingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

// Error pages
const UnauthorizedPage = lazy(() => import('@/features/errors/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));

// ─── Root Redirect Logic ──────────────────────────────────────────────────────
const RootRedirect = () => {
  const { isAuthenticated, isInitializing, user, isAdmin } = useAuth();
  
  if (isInitializing) return <PageLoader />;
  
  const isLibrarian = user?.roles?.includes(APP_ROLES.Librarian) && !isAdmin;
  
  if (isAuthenticated && (isAdmin || isLibrarian)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  // Normal users and guests go to /home
  return <Navigate to={ROUTES.HOME} replace />;
};

// ─── Suspense fallback ────────────────────────────────────────────────────────
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
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      // ── Public Routes (accessible to everyone) ──────────────────────────────
      {
        path: ROUTES.HOME,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.ABOUT,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CONTACT,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        ),
      },
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
      
      // ── Public Auth Routes (accessible only to Guests) ──────────────────────
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

      // ── Authenticated Routes (Accessible to Any Role) ───────────────────────
      {
        path: ROUTES.FAVORITES,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <FavoritesPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/app/books/:id/read',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <BookReaderPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.MY_BORROWINGS,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyBorrowingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      // ── Admin and Librarian Routes ──────────────────────────────────────────
      {
        path: ROUTES.DASHBOARD,
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: 'app/admin/subscriptions',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminSubscriptionsPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_BOOKS,
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminBooksPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_BOOK_CREATE,
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateBookPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: '/app/books/:id/edit',
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <EditBookPage />
            </Suspense>
          </LibrarianRoute>
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
        path: '/app/authors/:id',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <AuthorDetailPage />
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
        path: '/app/categories/:id',
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <CategoryDetailPage />
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
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <AllBorrowingsPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: '/app/borrowings/:id',
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <BorrowingDetailPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: ROUTES.USERS,
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.MEMBERS,
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <MembersPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },
      {
        path: '/app/members/:id',
        element: (
          <LibrarianRoute>
            <Suspense fallback={<PageLoader />}>
              <MemberDetailPage />
            </Suspense>
          </LibrarianRoute>
        ),
      },

      // ── Error Routes ────────────────────────────────────────────────────────
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
    ],
  },
]);
