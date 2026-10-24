import type { CompanyType } from "./types";

// značka pored stavke menija (stil iz dizajn/code.html): "solid" = broj u punom pilu, "muted"/"mutedHigh" = oznaka uloge, "info" = novo
export type NavBadgeTone = "solid" | "muted" | "mutedHigh" | "info";

export interface NavBadge {
  text: string;
  tone: NavBadgeTone;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string; // naziv ikone iz Material Symbols
  badge?: NavBadge; // statična značka; dinamične (brojevi) dodaje container
}

const DOCTOR_NAV: NavItem[] = [
  { href: "/dashboard", label: "Kontrolna tabla", icon: "grid_view" },
  { href: "/orders", label: "Porudžbine", icon: "inventory_2" },
  { href: "/patients", label: "Pacijenti", icon: "groups", badge: { text: "Dr", tone: "muted" } },
  { href: "/services", label: "Usluge", icon: "medical_services", badge: { text: "Lab", tone: "mutedHigh" } },
  { href: "/finance", label: "Finansije", icon: "account_balance_wallet", badge: { text: "RSD", tone: "muted" } },
  { href: "/connections", label: "Veze", icon: "hub" },
  { href: "/profile", label: "Profil", icon: "settings" },
];

const LAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Kontrolna tabla", icon: "grid_view" },
  { href: "/orders", label: "Porudžbine", icon: "inventory_2" },
  { href: "/services", label: "Usluge", icon: "medical_services", badge: { text: "Lab", tone: "mutedHigh" } },
  { href: "/connections", label: "Veze", icon: "hub" },
  { href: "/profile", label: "Profil", icon: "settings" },
];

// meni zavisi od tipa firme (doktor vs. protetičar)
export function getNavItems(type: CompanyType): NavItem[] {
  return type === "doktor" ? DOCTOR_NAV : LAB_NAV;
}

export function getCompanyTypeLabel(type: CompanyType): string {
  return type === "doktor" ? "Doktor" : "Protetičar";
}

// "/orders/12" je aktivna stavka "/orders"
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
