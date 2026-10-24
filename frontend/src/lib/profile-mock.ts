// ⚠ MOCK PODACI — dizajn profila (dizajn/profil) prikazuje polja i sekcije koje backend nema: logo/pečat, specijalizaciju, MB, PIB,
// broj licence, radno vreme kurira, tim, cloud STL skladište, intraoralne skenere, promenu lozinke, 2FA i aktivne sesije.
// Stvarno ostaje samo: naziv, tip, adresa, telefon i email firme (GET/PATCH /firme/me). Spisak odstupanja: documentation/REDIZAJN_MOCK.md §12.

export const MOCK_LOGO = {
  url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1IMYq75mm5BzEJhB3g3oM0X1xoLYwnPhE7402oxEPBFjuX6og6YLIsesivnjVD3kDbLHu90fvek1XS6qA8yTCA5BQPIjmXZvdR3Uw0LWeWyC2_uLcULvs8FKMqHZ1Ggm_RbgT4ZtGD4eGxK1aZyzaHUaqOKJCYrwMJSPdmoh_6SHmWCh91gVP-7ErViVTqnjGBi7PiX8AhiGTeSapvZ8jJmK_3WeVdAsSwP9lamu7u3xwYU27xQEW",
  alt: "Amblem ordinacije",
};

export const MOCK_FACILITY_STATUS = "Licencirana praksa (SKS)";

export const MOCK_SPECIALIZATIONS = [
  "Stomatološka protetika i implantologija",
  "Opšta stomatologija",
  "Ortopedija vilica (Ortodoncija)",
  "Oralna hirurgija i parodontologija",
  "Estetska stomatologija i endodoncija",
];

export const MOCK_IDENTITY = {
  registrationNumber: "08924182", // matični broj
  taxId: "108492819", // PIB
  license: "#SLD-49210-BG",
  courierHours: "Pon - Pet: 08:00 - 20:00, Sub: 09:00 - 14:00",
};

export const MOCK_TEAM_COUNT = 3;

export const MOCK_STORAGE = {
  percent: 68,
  text: "Iskorišćeno 34.2 GB od 50 GB medicinskog clouda za arhivu 3D pacijenata.",
};

export interface MockScanner {
  name: string;
  version: string;
  icon: string;
  iconTone: "primary" | "tertiary" | "muted";
  status: { label: string; connected: boolean };
}

export const MOCK_SCANNERS: MockScanner[] = [
  {
    name: "3Shape TRIOS Unite",
    version: "v21.4",
    icon: "center_focus_strong",
    iconTone: "primary",
    status: { label: "Povezano — Sinhronizacija u realnom vremenu", connected: true },
  },
  {
    name: "Medit Link Cloud API",
    version: "i700 Wireless",
    icon: "devices_fold",
    iconTone: "tertiary",
    status: { label: "Povezano — API Token važi do 12/2025", connected: true },
  },
  {
    name: "Align iTero Cloud",
    version: "Element 5D",
    icon: "cloud_sync",
    iconTone: "muted",
    status: { label: "Dostupno za povezivanje", connected: false },
  },
];

export const MOCK_TWO_FACTOR_TEXT = "Uključena zaštita putem Google Authenticator aplikacije i SMS koda na +381 64 •••• 128";

export interface MockSession {
  device: string;
  icon: string;
  details: string;
  isCurrent: boolean;
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    device: "Chrome na macOS (Ordinacija Računar 1)",
    icon: "laptop_mac",
    details: "Beograd, Srbija • IP: 178.222.45.109 • Aktivno sada",
    isCurrent: true,
  },
  {
    device: "iPad Pro (Stolna kontrolna tabla 2)",
    icon: "tablet_mac",
    details: "Beograd, Srbija • Poslednja aktivnost pre 48 minuta",
    isCurrent: false,
  },
];
