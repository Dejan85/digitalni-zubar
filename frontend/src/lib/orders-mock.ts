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
export function hash(value: string): number {
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

// MOCK (detalj porudžbine, dizajn/porudzbina): FDI zubi, boja, tehnički detalji stavki, karton/JMBG/alergije pacijenta,
// kontakt i licenca ordinacije, adresa laboratorije, kurir — backend i domen nemaju nijedno od ovih polja.
export interface MockItemExtras {
  detail: string;
  chips: { icon: string; text: string }[];
  fdi: string;
  shade: { label: string; color: string } | null;
  shadeLabel: string; // tekst kad stavka nema boju (npr. "Ti Base")
}

const ITEM_EXTRAS: MockItemExtras[] = [
  {
    detail: "Monolitni cirkon Multi-Layer (Katana HTML)",
    chips: [
      { icon: "blur_on", text: "Translucencija: Srednja" },
      { icon: "auto_fix_high", text: "Morfologija: Anatomska" },
    ],
    fdi: "14, 15",
    shade: { label: "A2", color: "#E5D7B7" },
    shadeLabel: "",
  },
  {
    detail: "Titan Grade 5, CNC glodanje po meri imp. platforme (Mis V3 kompatibilno)",
    chips: [{ icon: "", text: "Emergence profile: anatomski konkavan" }],
    fdi: "14",
    shade: null,
    shadeLabel: "Ti Base",
  },
  {
    detail: "E-max press keramika, individualna stratifikacija",
    chips: [{ icon: "blur_on", text: "Translucencija: Visoka" }],
    fdi: "21, 22",
    shade: { label: "BL2", color: "#F1ECDD" },
    shadeLabel: "",
  },
];

export function mockItemExtras(itemId: string, index: number): MockItemExtras {
  return ITEM_EXTRAS[(hash(itemId) + index) % ITEM_EXTRAS.length];
}

export interface MockOrderDetailExtras {
  recordNumber: string; // "#JP-882"
  ageText: string; // "42 god."
  birthDate: string; // "14.05.1983."
  genderLabel: string; // "Muški" / "Ženski"
  jmbg: string;
  allergies: string;
  doctorTitle: string;
  doctorPhone: string;
  doctorAddress: string;
  license: string;
  labAddress: string;
  assignedTechnician: string;
  courier: string;
  labPhone: string;
}

export function mockOrderDetailExtras(order: Order, patientInitials: string): MockOrderDetailExtras {
  const h = hash(`detail-${order.id}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  const age = 25 + ((h >>> 4) % 40);
  const year = new Date().getFullYear() - age;
  const day = 1 + ((h >>> 7) % 28);
  const month = 1 + ((h >>> 11) % 12);
  const digits = String(hash(`jmbg-${order.id}`)).padStart(10, "0").slice(0, 10);
  return {
    recordNumber: `#${patientInitials || "XX"}-${100 + (h % 900)}`,
    ageText: `${age} god.`,
    birthDate: `${pad(day)}.${pad(month)}.${year}.`,
    genderLabel: (h >>> 12) % 2 === 0 ? "Muški" : "Ženski",
    jmbg: `${pad(day)}${pad(month)}${String(year).slice(1)}${digits.slice(0, 6)}`,
    allergies:
      "Nema evidentiranih alergija na lokalnu anesteziju ili zubotehničke metale. Gingiva zdrava, bez znakova upale.",
    doctorTitle: "Spec. stom. protetike",
    doctorPhone: `+381 6${h % 10} ${100 + ((h >>> 3) % 900)} ${1000 + ((h >>> 9) % 9000)}`,
    doctorAddress: "Bulevar oslobođenja 78, 11000 Beograd",
    license: `#SLD-${40000 + (h % 9999)}`,
    labAddress: "Njegoševa 45, Vračar, Beograd",
    assignedTechnician: "Petar Jovanović",
    courier: "DExpress Medical Express",
    labPhone: "+381 11 244 5678",
  };
}

// ⚠ MOCK — ekran "Nova porudžbina" (dizajn/kreiranje novog protetskog naloga).
// FDI šema zuba, VITA boja, translucencija, oblik, kurirsko preuzimanje i procena roka nemaju podlogu u backendu
// (POST /porudzbine prima samo laboratoriju, pacijenta i stavke). Spisak: documentation/REDIZAJN_MOCK.md §4.
export interface MockTooth {
  fdi: string;
  label: string;
}

const TOOTH_LABELS = ["I1", "I2", "C", "P1", "P2", "M1", "M2", "M3"];
const quadrant = (q: number): MockTooth[] => TOOTH_LABELS.map((label, i) => ({ fdi: `${q}${i + 1}`, label }));

// desna strana pacijenta (kvadranti 1 i 4) ide od zadnjeg zuba ka sredini, leva (2 i 3) od sredine ka zadnjem
export const MOCK_UPPER_TEETH = { right: quadrant(1).reverse(), left: quadrant(2) };
export const MOCK_LOWER_TEETH = { right: quadrant(4).reverse(), left: quadrant(3) };

export const MOCK_ALL_TEETH = [
  ...MOCK_UPPER_TEETH.right,
  ...MOCK_UPPER_TEETH.left,
  ...MOCK_LOWER_TEETH.right,
  ...MOCK_LOWER_TEETH.left,
].map((t) => t.fdi);
export const MOCK_FRONT_TEETH = ["13", "12", "11", "21", "22", "23"];

export const MOCK_SPEC_OPTIONS = {
  shade: ["A2 (Standard)", "A1 (Svetlija)", "A3 (Tamnija)", "B1 (Beljena)", "B2", "BL2 (Bleach)"],
  translucency: ["Prirodna (HT)", "Visoka (ST/UT)", "Opakna / maskirna"],
  shape: ["Anatomski pun profil", "Redukcija za fasetiranje", "Minimalna preparacija"],
};

export const MOCK_LAB_LEAD_TIME = "Standardni rok izrade: 3-5 radnih dana";

// ⚠ MOCK — ekran "Pacijenti i medicinski kartoni" (dizajn/pacijenti i medicinski kartoni).
// Pacijent u backendu ima samo ime, prezime, datum rođenja i pol: broj kartona, JMBG, telefon, e-mail i medicinske
// napomene ne postoje. Računaju se deterministički iz ID-a pacijenta. Spisak: documentation/REDIZAJN_MOCK.md §5.
export interface MockPatientExtras {
  recordNumber: string; // npr. "#JP-882"
  jmbg: string;
  phone: string; // prikaz, npr. "+381 64 123 4567"
  phoneHref: string; // npr. "tel:+381641234567"
  email: string;
}

const EMAIL_DOMAINS = ["email.rs", "gmail.com", "mts.rs", "yahoo.com", "eunet.rs", "outlook.com"];
// mala slova latinice bez dijakritika za e-mail adresu
const asciiOf = (value: string) =>
  value
    .toLowerCase()
    .replace(/đ/g, "dj")
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z]/g, "");

export function mockPatientExtras(patient: {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}): MockPatientExtras {
  const h = hash(`patient-${patient.id}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  const born = new Date(patient.birthDate);
  const digits = String(hash(`jmbg-${patient.id}`)).padStart(10, "0").slice(0, 5);
  const operator = [60, 61, 62, 63, 64, 65, 69][h % 7];
  const part1 = 100 + ((h >>> 4) % 900);
  const part2 = 1000 + ((h >>> 12) % 9000);
  const initials = `${patient.firstName[0] ?? "X"}${patient.lastName[0] ?? "X"}`.toUpperCase();
  return {
    recordNumber: `#${initials}-${100 + (h % 900)}`,
    jmbg: `${pad(born.getDate())}${pad(born.getMonth() + 1)}${String(born.getFullYear()).slice(1)}71${digits}`,
    phone: `+381 ${operator} ${part1} ${part2}`,
    phoneHref: `tel:+381${operator}${part1}${part2}`,
    email: `${asciiOf(patient.firstName)[0] ?? "x"}.${asciiOf(patient.lastName)}@${EMAIL_DOMAINS[(h >>> 8) % EMAIL_DOMAINS.length]}`,
  };
}

// polja forme novog pacijenta (drawer) koja backend nema — prikazuju se onemogućena
export const MOCK_NEW_PATIENT = { recordNumber: "#MK-902" };

// ⚠ MOCK — ekran "Katalog usluga" (dizajn/katalog). Usluga u backendu ima samo naziv i cenu: šifra, kategorija, rok izrade,
// zahtevani otisak, opis i status "aktivna" ne postoje. Kategorija se pogađa po nazivu, ostalo se računa deterministički
// iz ID-a usluge. Spisak: documentation/REDIZAJN_MOCK.md §9.
export type MockServiceCategory = "fixed" | "removable" | "implant" | "ortho";
export type MockImpressionKind = "digital" | "analog" | "both" | "cbct";

export interface MockServiceExtras {
  code: string; // npr. "FP-07"
  category: MockServiceCategory;
  leadDays: number;
  impression: MockImpressionKind;
  description: string;
}

export const MOCK_SERVICE_CATEGORIES: { value: MockServiceCategory; label: string; prefix: string; badgeClass: string }[] = [
  { value: "fixed", label: "Fiksna protetika", prefix: "FP", badgeClass: "bg-surface-container text-on-surface" },
  { value: "removable", label: "Mobilna protetika", prefix: "MP", badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed" },
  { value: "implant", label: "Implantoprotetika", prefix: "IP", badgeClass: "bg-secondary-container text-on-secondary-container" },
  { value: "ortho", label: "Ortodoncija & Splintovi", prefix: "OS", badgeClass: "bg-surface-container-high text-on-surface" },
];

const SERVICE_DESCRIPTIONS: Record<MockServiceCategory, string[]> = {
  fixed: [
    "Višeslojna keramika, visoka translucencija, individualno fasetiranje",
    "Precizna marginalna adaptacija, estetska glazura i mikro-teksturisanje",
    "Skelet bez nikla, višeslojna keramika, kontrola okluzije",
  ],
  removable: [
    "Visokopolimerizovani ružičasti akrilat, kompletna garnitura zuba",
    "Livena Co-Cr konstrukcija visoke elastičnosti, klizači i atečmeni",
  ],
  implant: [
    "CNC glodani titanijum Grade 5, uključuje ti-base bazu i laboratorijski šraf",
    "Biokompatibilna smola, metalne titanijumske čaure, digitalno planiranje",
  ],
  ortho: ["Dvoslojni termo-fleksibilan materijal, visoka udobnost protiv bruksizma", "Termoformirani sloj 2.0mm, precizno prianjanje"],
};

export const MOCK_IMPRESSION_LABELS: Record<MockImpressionKind, string> = {
  digital: "Digitalni STL",
  analog: "Analogni otisak",
  both: "Analogni / Digitalni",
  cbct: "Digitalni STL + CBCT",
};

function mockServiceCategory(name: string, h: number): MockServiceCategory {
  const n = name.toLowerCase();
  if (/implant|abutment|vodi[cč]/.test(n)) return "implant";
  if (/proteza|skelet|vizil|akril/.test(n)) return "removable";
  if (/splint|ortod|alajner|retainer/.test(n)) return "ortho";
  if (/krunic|most|faset|vinir|inlay|onlay|cirkon|keram|e-?max/.test(n)) return "fixed";
  return MOCK_SERVICE_CATEGORIES[h % MOCK_SERVICE_CATEGORIES.length].value;
}

export function mockServiceExtras(service: { id: string; name: string }): MockServiceExtras {
  const h = hash(`service-${service.id}`);
  const category = mockServiceCategory(service.name, h);
  const meta = MOCK_SERVICE_CATEGORIES.find((c) => c.value === category)!;
  const descriptions = SERVICE_DESCRIPTIONS[category];
  const impression: MockImpressionKind =
    category === "implant" ? (h % 2 ? "cbct" : "digital") : category === "removable" ? (h % 2 ? "both" : "analog") : (["digital", "both", "analog"] as const)[(h >>> 3) % 3];
  return {
    code: `${meta.prefix}-${String(10 + ((h >>> 5) % 90))}`,
    category,
    leadDays: 2 + ((h >>> 9) % 5),
    impression,
    description: descriptions[(h >>> 13) % descriptions.length],
  };
}

// polja forme nove usluge koja backend nema — prikazuju se onemogućena
export const MOCK_NEW_SERVICE = { code: "FP-15" };
