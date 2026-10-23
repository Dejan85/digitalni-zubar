"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";

// ulogovan korisnik nema šta da radi na login/register
export function AuthLayoutContainer({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  return <AuthLayout>{children}</AuthLayout>;
}
