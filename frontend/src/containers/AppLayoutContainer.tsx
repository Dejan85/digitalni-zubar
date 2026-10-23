"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppLayout } from "@/components/layouts/AppLayout";
import { useAuth } from "@/lib/auth";

// zaštita ruta: bez sesije → /login; labela tipa firme se računa ovde, layout dobija gotov tekst
export function AppLayoutContainer({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (!session) return null; // undefined (učitava se) ili null (redirect u toku)

  return (
    <AppLayout companyTypeLabel={session.type === "doktor" ? "Ordinacija" : "Laboratorija"} onSignOut={() => signOut()}>
      {children}
    </AppLayout>
  );
}
