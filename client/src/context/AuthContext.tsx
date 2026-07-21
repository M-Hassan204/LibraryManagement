import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth.api';
import { storageService } from '@/services/storage.service';
import { APP_ROLES } from '@/constants/roles';
import type { AuthResponseDto, AuthenticatedUser } from '@/types/auth.types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactElement {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ── On mount: attempt to restore session from stored refresh token ────────
  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const refreshToken = storageService.getRefreshToken();
      const accessToken = storageService.getAccessToken();

      if (!refreshToken || !accessToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await authApi.refreshToken({
          token: accessToken,
          refreshToken,
        });

        if (response.success && response.data) {
          storageService.setAccessToken(response.data.token);
          storageService.setRefreshToken(response.data.refreshToken);
          setUser(mapToAuthenticatedUser(response.data));
        } else {
          storageService.clearAll();
        }
      } catch {
        storageService.clearAll();
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, []);

  // ── Login: called after a successful auth response ────────────────────────
  const login = useCallback((data: AuthResponseDto): void => {
    storageService.setAccessToken(data.token);
    storageService.setRefreshToken(data.refreshToken);
    setUser(mapToAuthenticatedUser(data));
  }, []);

  // ── Logout: clears all stored tokens and user state ───────────────────────
  const logout = useCallback((): void => {
    storageService.clearAll();
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.roles.includes(APP_ROLES.Admin) ?? false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      isInitializing,
      login,
      logout,
    }),
    [user, isAuthenticated, isAdmin, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapToAuthenticatedUser(data: AuthResponseDto): AuthenticatedUser {
  return {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`.trim(),
    roles: data.roles,
  };
}
