import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { SessionContext } from '@kesbyar/shared';

import { apiGet, apiPost, type AuthCredentials } from '@/api/client';
import { apiUrl, MOBILE_HEADERS } from '@/config';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  saveOrganizationId,
} from '@/auth/storage';

type Workspace = {
  organizationId: string;
  organizationName: string;
  role: string;
  workspaceId: string;
  industryPack: string;
  industrySpecialty: string | null;
};

type LoginResult = {
  id: string;
  name: string;
  email: string;
  organizationId: string | null;
  isSuperAdmin: boolean;
  redirectTo: string;
  token: string;
  expiresAt: string;
  workspaces: Workspace[];
};

type AuthState = {
  credentials: AuthCredentials;
  session: SessionContext;
  workspaces: Workspace[];
};

type AuthContextValue = {
  loading: boolean;
  auth: AuthState | null;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  selectWorkspace: (organizationId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState | null>(null);

  const refreshSession = useCallback(async () => {
    const stored = await loadAuthSession();
    if (!stored) {
      setAuth(null);
      return;
    }

    const credentials: AuthCredentials = {
      token: stored.token,
      organizationId: stored.organizationId,
    };

    const data = await apiGet<{ session: SessionContext; workspaces: Workspace[] }>(
      '/api/auth/session',
      credentials,
    );

    setAuth({
      credentials,
      session: data.session,
      workspaces: data.workspaces,
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshSession();
      } catch {
        await clearAuthSession();
        setAuth(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [MOBILE_HEADERS.client]: MOBILE_HEADERS.clientValue,
      },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json();
    if (!body.success) {
      throw new Error(body.error?.message ?? 'ورود ناموفق');
    }

    const data = body.data as LoginResult;
    if (!data.token || !data.expiresAt) {
      throw new Error('پاسخ ورود موبایل ناقص است');
    }

    await saveAuthSession({
      token: data.token,
      organizationId: data.organizationId,
      expiresAt: data.expiresAt,
    });

    const credentials: AuthCredentials = {
      token: data.token,
      organizationId: data.organizationId,
    };

    setAuth({
      credentials,
      session: {
        user: { id: data.id, email: data.email, name: data.name },
        organizationId: data.organizationId ?? '',
        organizationName: data.workspaces[0]?.organizationName ?? 'پلتفرم',
        role: data.workspaces[0]?.role ?? 'OWNER',
        workspaceId: data.workspaces[0]?.workspaceId ?? '',
        industryPack: data.workspaces[0]?.industryPack ?? 'GENERAL',
        industrySpecialty: data.workspaces[0]?.industrySpecialty ?? null,
        platformRole: data.isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
        isSuperAdmin: data.isSuperAdmin,
      },
      workspaces: data.workspaces,
    });

    return data.redirectTo;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (auth?.credentials) {
        await apiPost('/api/auth/logout', auth.credentials);
      }
    } catch {
      // ignore network errors on logout
    }
    await clearAuthSession();
    setAuth(null);
  }, [auth?.credentials]);

  const selectWorkspace = useCallback(
    async (organizationId: string) => {
      if (!auth?.credentials) return;
      await apiPost('/api/workspace/select', auth.credentials, { organizationId });
      await saveOrganizationId(organizationId);
      await refreshSession();
    },
    [auth?.credentials, refreshSession],
  );

  const value = useMemo(
    () => ({
      loading,
      auth,
      login,
      logout,
      refreshSession,
      selectWorkspace,
    }),
    [loading, auth, login, logout, refreshSession, selectWorkspace],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthCredentials(): AuthCredentials | null {
  const { auth } = useAuth();
  return auth?.credentials ?? null;
}

export function useSession(): SessionContext | null {
  const { auth } = useAuth();
  return auth?.session ?? null;
}
