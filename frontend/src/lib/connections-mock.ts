import { hash } from "./orders-mock";

// ⚠ MOCK — dizajn povezanih saradnika (dizajn/povezani saradnici) ima fotografiju laboratorije na kartici.
// Fotografija ne postoji u domenu (firma nema sliku), pa se zaglavlje kartice boji deterministički po ID-ju firme.
// Spisak odstupanja: documentation/REDIZAJN_MOCK.md §10.

const HEADER_GRADIENTS = [
  "from-primary to-secondary",
  "from-tertiary to-primary",
  "from-secondary to-primary-container",
  "from-primary-container to-tertiary-container",
];

export const mockHeaderGradient = (companyId: string): string => HEADER_GRADIENTS[hash(companyId) % HEADER_GRADIENTS.length];

// minuti → "42 min" / "3 h" / "2 dana" (za KPI "Prosečan odziv partnera")
export function formatResponseTime(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(Math.max(1, Math.round(minutes))), unit: "min" };
  if (minutes < 60 * 24) return { value: String(Math.round(minutes / 60)), unit: "h" };
  return { value: String(Math.round(minutes / (60 * 24))), unit: "dana" };
}

// "pre 3 sata" / "juče" / "pre 5 dana" za listu primljenih zahteva
export function formatReceivedAgo(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "upravo sada";
  if (minutes < 60) return `pre ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `pre ${hours} ${hours === 1 ? "sat" : hours < 5 ? "sata" : "sati"}`;
  const days = Math.round(hours / 24);
  return days === 1 ? "juče" : `pre ${days} dana`;
}
