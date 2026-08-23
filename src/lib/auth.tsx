"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  id: number;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  /** Returns the visitor/session ID for API calls. Anonymous UUID if not logged in. */
  getSessionId: () => string;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
  getSessionId: () => "",
});

const TOKEN_KEY = "easeur-session-token";
const VISITOR_KEY = "easeur-workout-visitor-id";

function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token }),
      });
      const data = await res.json();
      if (data.ok) setUser(data.user);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { verify(); }, [verify]);

  const login = useCallback(async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, name }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(TOKEN_KEY, data.user.token);
        // Link anonymous visitor data to the authenticated session
        const oldVisitor = localStorage.getItem(VISITOR_KEY);
        if (oldVisitor) {
          localStorage.setItem(VISITOR_KEY, data.user.token);
        }
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, error: data.error };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout", token }),
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const getSessionId = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token || getAnonymousId();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getSessionId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
