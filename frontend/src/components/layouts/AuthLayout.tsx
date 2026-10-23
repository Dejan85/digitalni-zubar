import type { ReactNode } from "react";

// samo raspored: centrirana kartica na menta pozadini sa naslovom aplikacije
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-tint px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-primary-dark">Digitalni zubar</h1>
        {children}
      </div>
    </main>
  );
}
