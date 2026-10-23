import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

interface AppLayoutProps {
  companyTypeLabel: string;
  onSignOut: () => void;
  children: ReactNode;
}

// samo raspored: header + sadržaj; sve što je dinamično stiže kroz props-e. Pravi sidebar dolazi u F2.
export function AppLayout({ companyTypeLabel, onSignOut, children }: AppLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-primary/15 bg-card px-6 py-3">
        <span className="font-semibold text-primary-dark">Digitalni zubar</span>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{companyTypeLabel}</span>
          <Button variant="outline" className="h-9 px-4" onClick={onSignOut}>
            Odjavi se
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
