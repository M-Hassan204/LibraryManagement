import { type ReactElement, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { APP_ROLES } from '@/constants/roles';


interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards a route so that only authenticated users can access it.
 * Unauthenticated users are redirected to /login.
 * The current location is passed as state so LoginPage can redirect
 * back after a successful login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // While session restoration is in progress, render nothing to avoid flicker.
  if (isInitializing) {
    return <></>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
}

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Guards a route so that only users with the Admin role can access it.
 * Authenticated non-admin users are redirected to /unauthorized.
 * Unauthenticated users are redirected to /login first.
 */
export function AdminRoute({ children }: AdminRouteProps): ReactElement {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <></>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  if (!user?.roles.includes(APP_ROLES.Admin)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
}

export function LibrarianRoute({ children }: AdminRouteProps): ReactElement {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!user?.roles.includes(APP_ROLES.Librarian) && !user?.roles.includes(APP_ROLES.Admin)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
}

export function MemberRoute({ children }: AdminRouteProps): ReactElement {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!user?.roles.includes(APP_ROLES.Member) && !user?.roles.includes(APP_ROLES.Admin)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Guards public-only routes (Login, Register, etc.).
 * If the user is already authenticated, they are redirected away
 * so they don't land on the login page while already logged in.
 */
export function PublicRoute({ children }: PublicRouteProps): ReactElement {
  const { isAuthenticated, user, isInitializing } = useAuth();

  if (isInitializing) {
    return <></>;
  }

  if (isAuthenticated) {
    let target: string = ROUTES.BOOKS;
    if (user?.roles.includes(APP_ROLES.Admin)) target = ROUTES.DASHBOARD;
    else if (user?.roles.includes(APP_ROLES.Librarian)) target = '/app/librarian/dashboard';
    else if (user?.roles.includes(APP_ROLES.Member)) target = '/app/member/home';

    return (
      <Navigate
        to={target}
        replace
      />
    );
  }

  return <>{children}</>;
}
