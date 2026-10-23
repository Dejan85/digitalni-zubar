import type { CompanyType } from "./types";

export interface NavItem {
  href: string;
  label: string;
}

const DOCTOR_NAV: NavItem[] = [
  { href: "/dashboard", label: "Pregled" },
  { href: "/orders", label: "Porudžbine" },
  { href: "/patients", label: "Pacijenti" },
  { href: "/services", label: "Katalog usluga" },
  { href: "/connections", label: "Laboratorije" },
  { href: "/profile", label: "Profil ordinacije" },
];

const LAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Pregled" },
  { href: "/orders", label: "Porudžbine" },
  { href: "/services", label: "Moje usluge" },
  { href: "/connections", label: "Ordinacije" },
  { href: "/profile", label: "Profil laboratorije" },
];

// meni zavisi od tipa firme (doktor vs. protetičar)
export function getNavItems(type: CompanyType): NavItem[] {
  return type === "doktor" ? DOCTOR_NAV : LAB_NAV;
}

export function getCompanyTypeLabel(type: CompanyType): string {
  return type === "doktor" ? "Ordinacija" : "Laboratorija";
}

// "/orders/12" je aktivna stavka "/orders"
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
