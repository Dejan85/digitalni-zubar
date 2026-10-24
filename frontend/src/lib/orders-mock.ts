import type { Order } from "./types";

// ⚠ MOCK PODACI — ovo NISU pravi podaci iz backend-a.
// Dizajn liste porudžbina (dizajn/porudzbine) prikazuje polja koja `GET /porudzbine` ne vraća (usluge i zubi, boja,
// tip otiska, godine/pol pacijenta, grad i verifikacija partnera). Da bi ekran izgledao kao mock, ovde se ona
// popunjavaju deterministički iz ID-a porudžbine (isti ID → uvek isti prikaz). Kad backend počne da vraća prava polja,
// obrisati ovaj fajl i čitati vrednosti iz `Order`. Spisak odstupanja: documentation/TASKS.md → "Mock podaci u listi porudžbina".

export interface MockOrderExtras {
  service: { title: string; detail: string; tag?: string; tagTone?: "neutral" | "error" };
  impression: { kind: "digital" | "analog"; label: string };
  patientMeta: string; // npr. "42 god • M"
  avatarTone: "primary" | "secondary" | "neutral" | "tertiary";
  partnerCity: string;
  partnerVerified: boolean;
}

const SERVICES: MockOrderExtras["service"][] = [
  { title: "2x Cirkonijum krunica", tag: "FDI: 14, 15", detail: "Boja: A2 (Vita)" },
  { title: "E-max fasete (Laminates)", tag: "6x front (13-23)", detail: "Boja: BL2" },
  { title: "Totalna akrilatna proteza", detail: "Gornja vilica • Ivoclar zubi" },
  { title: "Metalo-keramički most", tag: "FDI: 24-27", detail: "Boja: A3" },
  { title: "All-on-4 Hibridni most", detail: "Titanijumska prečka + PMMA" },
  { title: "Vizil parcijalna proteza", detail: "Donja vilica • Atečmeni" },
  { title: "Inlay / Onlay keramika", tag: "FDI: 36 (MOD)", detail: "Boja: A3" },
  { title: "Hirurški vodič za implantate", detail: "3D Print (Sleeve Ø 3.5mm)" },
  { title: "Retencioni splint (Noćni)", detail: "Termoformirani sloj 2.0mm" },
  { title: "Individualni abutment + Ti", tag: "FDI: 21", detail: "Zirconia baza" },
];

const CITIES = ["Beograd, Vračar", "Novi Sad", "Niš", "Kragujevac"];
const AVATAR_TONES: MockOrderExtras["avatarTone"][] = ["primary", "secondary", "neutral", "tertiary"];

// jednostavan stabilan hash stringa (FNV-1a) → nenegativan broj
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mockOrderExtras(order: Order, partnerName: string): MockOrderExtras {
  const h = hash(order.id);
  const p = hash(partnerName);
  const base = SERVICES[h % SERVICES.length];
  const isRework = order.status === "vracena_na_doradu";
  const isDigital = (h >>> 8) % 100 < 80;
  return {
    service: isRework ? { ...base, tag: "Dorada okluzije", tagTone: "error" } : base,
    impression: isDigital
      ? { kind: "digital", label: base.title.includes("vodič") ? "Digitalni 3D (STL+CBCT)" : "Digitalni 3D (STL)" }
      : { kind: "analog", label: "Analogni otisak" },
    patientMeta: `${25 + ((h >>> 4) % 40)} god • ${(h >>> 12) % 2 === 0 ? "M" : "Ž"}`,
    avatarTone: AVATAR_TONES[(h >>> 16) % AVATAR_TONES.length],
    partnerCity: CITIES[p % CITIES.length],
    partnerVerified: p % 4 !== 0,
  };
}

// MOCK (kontrolna tabla): broj kartona, vreme isporuke i vreme preuzimanja kurira — backend nema nijedno od ta tri polja.
export interface MockDashboardExtras {
  recordNumber: string; // npr. "#JP-882"
  deliveryTime: string; // npr. "14:00"
  courierTime: string; // npr. "10:15"
}

export function mockDashboardExtras(order: Order, patientInitials: string): MockDashboardExtras {
  const h = hash(`dash-${order.id}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    recordNumber: `#${patientInitials || "XX"}-${100 + (h % 900)}`,
    deliveryTime: `${pad(9 + (h % 9))}:${(h >>> 5) % 2 === 0 ? "00" : "30"}`,
    courierTime: `${pad(8 + ((h >>> 3) % 4))}:${pad(5 * ((h >>> 9) % 12))}`,
  };
}
