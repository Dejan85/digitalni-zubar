"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";

// ulogovan korisnik nema šta da radi na login/register
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  return (
    <main className="flex flex-1 items-center justify-center bg-surface-tint px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-primary-dark">Digitalni zubar</h1>
        {children}
      </div>
    </main>
  );
}
