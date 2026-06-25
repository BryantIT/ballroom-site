"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

interface AuthUser {
  userId: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the initial session check is in flight */
  loading: boolean;
  /** Call this to sign out and redirect to the landing page */
  signOut: () => Promise<void>;
  /** Re-fetch the current user (e.g. after sign-in) */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser({ userId: current.userId, username: current.username });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    await amplifySignOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Use inside any Client Component to access the current user and auth actions.
 *
 * @example
 * const { user, signOut, loading } = useAuth()
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
