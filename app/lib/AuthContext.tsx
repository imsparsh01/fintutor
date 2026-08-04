import { createContext, useContext, type ReactNode } from 'react';

interface AuthContextValue {
  userId: string | null;
}

const AuthContext = createContext<AuthContextValue>({ userId: null });

export function AuthProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
