import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { DEMO_TOKEN, DEMO_USER_ID } from '../services/demoData';

interface AuthState {
  token: string | null;
  userId: number | null;
}

interface AuthContextValue extends AuthState {
  isInitializing: boolean;
  login: (token: string, userId?: number) => void;
  logout: () => void;
}

const STORAGE_KEY = 'cta-auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadInitialState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, userId: null };
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    return {
      token: parsed.token ?? null,
      userId: parsed.userId ?? null,
    };
  } catch {
    return { token: null, userId: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadInitialState());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      if (!state.token) {
        setIsInitializing(false);
        return;
      }

      if (state.token === DEMO_TOKEN) {
        if (state.userId == null) {
          const nextState = { token: DEMO_TOKEN, userId: DEMO_USER_ID };
          setState(nextState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        }
        setIsInitializing(false);
        return;
      }

      try {
        const me = await api.getMe(state.token);
        if (cancelled) {
          return;
        }

        const nextState = { token: state.token, userId: me.id };
        setState(nextState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        if (cancelled) {
          return;
        }

        const nextState = { token: null, userId: null };
        setState(nextState);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isInitializing,
      login: (token: string, userId?: number) => {
        const nextState = { token, userId: userId ?? null };
        setState(nextState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      },
      logout: () => {
        const nextState = { token: null, userId: null };
        setState(nextState);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isInitializing, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
