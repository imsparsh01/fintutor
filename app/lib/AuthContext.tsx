import { createContext, useContext, type ReactNode } from 'react';

interface AuthContextValue {
  userId: string | null;
  // First name for the Home greeting ("Morning, {name}"). Optional — null when unknown
  // (e.g. the dev bypass without EXPO_PUBLIC_DEV_USER_NAME, or a session with no metadata).
  displayName?: string | null;
}

const AuthContext = createContext<AuthContextValue>({ userId: null, displayName: null });

export function AuthProvider({
  userId,
  displayName = null,
  children,
}: {
  userId: string | null;
  displayName?: string | null;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={{ userId, displayName }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
