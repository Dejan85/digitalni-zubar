"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

// zaštita ruta: bez sesije → /login. Pravi app shell (sidebar) dolazi u F2.
export default function AppLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (!session) return null; // undefined (učitava se) ili null (redirect u toku)

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-primary/15 bg-card px-6 py-3">
        <span className="font-semibold text-primary-dark">Digitalni zubar</span>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{session.type === "doktor" ? "Ordinacija" : "Laboratorija"}</span>
          <Button variant="outline" className="h-9 px-4" onClick={() => signOut()}>
            Odjavi se
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
