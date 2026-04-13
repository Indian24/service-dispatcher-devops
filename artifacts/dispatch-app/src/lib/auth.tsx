import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Minimal local User shape used by the UI. Keep fields used across the app (`role`, `email`, `name`, `id`).
export type User = {
  id: string;
  email: string | null;
  role: string;
  name?: string | null;
  phone?: string | null;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize session on mount and listen for auth changes from Supabase
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!mounted) return;

      if (session) {
        const u = session.user;
        setToken(session.access_token ?? null);
        setUser({
          id: u.id,
          email: u.email,
          role: (u.user_metadata as any)?.role ?? "customer",
          name: (u.user_metadata as any)?.full_name ?? null,
          phone: (u.user_metadata as any)?.phone ?? null,
        });
      } else {
        setToken(null);
        setUser(null);
      }

      setIsLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        const u = session.user;
        setToken(session.access_token ?? null);
        setUser({
          id: u.id,
          email: u.email,
          role: (u.user_metadata as any)?.role ?? "customer",
          name: (u.user_metadata as any)?.full_name ?? null,
          phone: (u.user_metadata as any)?.phone ?? null,
        });
      } else {
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Keep a compatible login/logout API for code that may call these directly
  const login = (_newToken: string, newUser: User) => {
    // When using Supabase we don't persist a custom token here; keep state in-sync
    setToken(_newToken ?? null);
    setUser(newUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
