import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import type { NavBadge, NavBadgeTone } from "@/lib/navigation";

export interface AppLayoutNavItem {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
  badge?: NavBadge;
}

interface AppLayoutProps {
  companyName?: string;
  roleLabel: string;
  isSuperAdmin: boolean;
  navItems: AppLayoutNavItem[];
  newOrderHref?: string; // bez vrednosti nema dugmeta "Nova porudžbina" u headeru
  alertCount: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

const BADGE: Record<NavBadgeTone, string> = {
  solid: "bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold",
  muted: "bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-1.5 py-0.5 rounded font-semibold uppercase",
  mutedHigh:
    "bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-1.5 py-0.5 rounded font-semibold uppercase",
  info: "bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold",
};

// raspored prenet iz dizajn/code.html: fiksni sidebar 260px + lepljivi header 68px (na mobilnom sidebar je izvlačni)
export function AppLayout({
  companyName,
  roleLabel,
  isSuperAdmin,
  navItems,
  newOrderHref,
  alertCount,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  isDarkTheme,
  onToggleTheme,
  onSignOut,
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex-1 bg-surface font-body-md text-body-md text-on-surface">
      {isMenuOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCloseMenu} aria-hidden />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] select-none flex-col justify-between bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform md:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          <div className="flex h-[68px] items-center gap-space-sm bg-surface-container-low/50 px-space-md">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
              <Icon name="dentistry" className="text-[22px]" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-headline-sm text-headline-sm leading-tight text-on-surface">
                Digitalni Zubar
              </span>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                B2B Dental Platform
              </span>
            </div>
          </div>

          <div className="px-space-md pb-space-xs pt-space-md">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Navigacija
            </span>
          </div>
          <nav aria-label="Glavni meni" className="flex flex-col gap-1 px-space-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMenu}
                aria-current={item.isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-space-sm py-2.5 transition-colors ${
                  item.isActive
                    ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <div className="flex min-w-0 items-center gap-space-sm">
                  <Icon name={item.icon} className="text-[20px]" />
                  <span className="truncate font-title-sm text-title-sm">{item.label}</span>
                </div>
                {item.isActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                ) : (
                  item.badge && <span className={BADGE[item.badge.tone]}>{item.badge.text}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-space-xs p-space-sm">
          <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-sm">
            <span className="line-clamp-2 font-title-sm text-title-sm font-semibold leading-snug text-on-surface">
              {companyName ?? "…"}
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold tracking-wide text-on-tertiary-fixed">
                {roleLabel}
              </span>
              {isSuperAdmin && (
                <span className="rounded bg-surface-variant px-1.5 py-0.5 font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">
                  Admin
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-space-sm py-2 text-error transition-colors hover:bg-error-container hover:text-on-error-container"
          >
            <Icon name="logout" className="text-[18px]" />
            <span className="font-title-sm text-title-sm font-semibold">Odjavi se</span>
          </button>
        </div>
      </aside>

      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-space-md bg-surface-container-lowest/90 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl md:px-space-lg">
          <div className="flex max-w-xl flex-1 items-center gap-space-md">
            <button
              type="button"
              onClick={onToggleMenu}
              aria-label="Otvori meni"
              aria-expanded={isMenuOpen}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container md:hidden"
            >
              <Icon name="menu" className="text-[24px]" />
            </button>
            <div className="relative hidden w-full items-center sm:flex">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 text-[20px] text-on-surface-variant"
              />
              <input
                className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-12 font-body-md text-body-md text-on-surface shadow-[0_1px_2px_rgba(15,23,42,0.05)] outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest"
                placeholder="Pretraga porudžbina, pacijenata, partnera..."
                type="text"
                aria-label="Pretraga"
              />
              <kbd className="absolute right-3 rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-[11px] font-medium text-on-surface-variant">
                ⌘K
              </kbd>
            </div>
            {newOrderHref && (
              <Link
                href={newOrderHref}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-space-md py-2 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <Icon name="add" className="text-[18px]" />
                <span className="hidden sm:inline">Nova porudžbina</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              aria-label={`Obaveštenja (${alertCount})`}
              className="relative flex size-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name="notifications" className="text-[22px]" />
              {alertCount > 0 && (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-error font-label-sm text-[10px] font-bold text-on-error">
                  {alertCount}
                </span>
              )}
            </button>
            <div className="hidden h-6 w-px bg-surface-variant sm:block" />
            <div className="hidden items-center gap-2 rounded-lg bg-surface-container-low px-space-sm py-1.5 text-on-surface sm:flex">
              <Icon name="swap_horiz" className="text-[18px] text-primary" />
              <span className="max-w-[200px] truncate text-left font-label-md text-label-md font-medium">
                {companyName ?? "…"} ({roleLabel})
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDarkTheme ? "Prebaci na svetlu temu" : "Prebaci na tamnu temu"}
              className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name={isDarkTheme ? "dark_mode" : "light_mode"} className="text-[20px]" />
            </button>
            <div className="relative flex items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                <Icon name="person" className="text-[18px] text-on-primary" />
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-primary-container ring-2 ring-surface-container-lowest" />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-68px)] w-full bg-surface p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
