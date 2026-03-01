import { createContext, useContext, useMemo, useState } from 'react';

interface AuthState {
  token: string | null;
  userId: number | null;
}

interface AuthContextValue extends AuthState {
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

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
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
    [state]
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
