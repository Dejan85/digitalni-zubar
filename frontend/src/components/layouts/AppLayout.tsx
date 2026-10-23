import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

export interface AppLayoutNavItem {
  href: string;
  label: string;
  isActive: boolean;
}

interface AppLayoutProps {
  companyName?: string;
  companyTypeLabel: string;
  navItems: AppLayoutNavItem[];
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

// samo raspored: sidebar (na mobilnom izvlačni) + header + sadržaj; sve dinamično stiže kroz props-e
export function AppLayout({
  companyName,
  companyTypeLabel,
  navItems,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  isDarkTheme,
  onToggleTheme,
  onSignOut,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-1">
      {isMenuOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onCloseMenu} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col gap-6 bg-primary-dark p-5 text-white transition-transform md:static md:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <span className="text-lg font-semibold">Digitalni zubar</span>
        <nav aria-label="Glavni meni" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMenu}
              aria-current={item.isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                item.isActive ? "bg-accent font-medium text-primary-dark" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-primary/15 bg-card px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMenu}
              aria-label="Otvori meni"
              aria-expanded={isMenuOpen}
              className="rounded-full border border-primary/30 px-3 py-1 text-sm text-heading md:hidden"
            >
              Meni
            </button>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-heading">{companyName ?? "…"}</span>
              <span className="text-xs text-muted">{companyTypeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 px-4" onClick={onToggleTheme} aria-pressed={isDarkTheme}>
              {isDarkTheme ? "Svetla tema" : "Tamna tema"}
            </Button>
            <Button variant="outline" className="h-9 px-4" onClick={onSignOut}>
              Odjavi se
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6">{children}</main>
      </div>
    </div>
  );
}
