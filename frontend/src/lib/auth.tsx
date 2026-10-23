"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { setOnUnauthorized } from "./api";
import { clearToken, decodeToken, readToken, writeToken, type Session } from "./auth-storage";

interface AuthContextValue {
  // undefined = još nismo pročitali localStorage (izbegava flash redirecta na login)
  session: Session | null | undefined;
  signIn: (token: string) => void;
  signOut: (message?: string) => void;
}

// localStorage kao spoljni izvor: komponente se pretplate i osveže se kad se token promeni
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => void listeners.delete(callback);
}
function notify() {
  listeners.forEach((callback) => callback());
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribe, readToken, () => undefined);
  const session = useMemo(() => (token === undefined ? undefined : token ? decodeToken(token) : null), [token]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const signIn = useCallback((newToken: string) => {
    writeToken(newToken);
    notify();
  }, []);

  const signOut = useCallback(
    (message?: string) => {
      clearToken();
      notify();
      queryClient.clear(); // keš pripada prethodnoj firmi
      router.replace(message ? `/login?message=${encodeURIComponent(message)}` : "/login");
    },
    [queryClient, router],
  );

  // 401 sa bilo kog endpointa = istekao token
  useEffect(() => {
    setOnUnauthorized(() => signOut("Sesija je istekla. Prijavi se ponovo."));
    return () => setOnUnauthorized(null);
  }, [signOut]);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth mora biti unutar AuthProvider-a");
  return context;
}
