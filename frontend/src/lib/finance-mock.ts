// ⚠ MOCK PODACI — cela stranica Finansije (dizajn/finansije) nema backend: nema faktura, SEF integracije, IPS plaćanja ni evidencije
// uplata. Svi brojevi, nazivi i datumi su preuzeti 1:1 iz dizajna. Spisak odstupanja: documentation/REDIZAJN_MOCK.md §14.

export interface InvoiceOrderLine {
  id: string;
  patient: string;
  item: string;
}

export interface Invoice {
  number: string;
  sefId: string;
  lab: string;
  labMeta: string;
  orders: InvoiceOrderLine[];
  summary?: { label: string; text: string; patients: string }; // zbirna specifikacija umesto pojedinačnih naloga
  issued: string;
  dueLine: { text: string; tone: "urgent" | "muted"; icon?: string };
  amount: string;
  amountNet: string;
  status: "pending" | "paid";
  actions: { icon: string; title: string; kind: "pay" | "icon" }[];
}

export interface MaterialUsage {
  name: string;
  quantity: string;
  quantityTone: string;
  cost: string;
  barClass: string;
  percent: number;
}

export interface LabShare {
  name: string;
  amount: string;
  percent: number;
  barClass: string;
}

export const FINANCE_COMPANY_PIB = "108492819";

export const FINANCE_KPIS = {
  debt: { label: "Ukupno zaduženje (Oktobar)", value: "428.600", trend: "+12.4%", trendNote: "u odnosu na septembar" },
  settled: { label: "Plaćeno / Izmireno", value: "342.200", percentLabel: "Procenat likvidnosti", percent: "79.8%", barWidth: 80 },
  dueSoon: { label: "Dospeva za naplatu (< 7 dana)", value: "86.400", note: "2 e-fakture čekaju nalog", urgency: "HITNO" },
  advance: { label: "Pretplata / Avansni kredit", value: "25.000", note: "DentalArt Lab depozit", state: "Aktivan" },
};

export type FinanceKpis = typeof FINANCE_KPIS;

export const FINANCE_TABS = [
  { label: "Sve fakture", count: "24", pill: "bg-surface-container text-primary font-data-mono text-[11px] font-bold" },
  { label: "Neplaćene", count: "2", pill: "bg-error-container text-on-error-container font-data-mono text-[11px] font-bold" },
  { label: "Plaćene", count: "21", pill: "bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]" },
  { label: "Avansni računi", count: "1", pill: "bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]" },
];

export const FINANCE_PERIODS = ["Oktobar 2025", "Septembar 2025", "Avgust 2025", "Q3 2025 (Kvartalni)"];
export const FINANCE_LABS = ["Sve laboratorije", "DentalArt Lab Beograd", "Zirkon Centar Kragujevac", "Elite Dental Lab Niš"];
export const FINANCE_STATUSES = ["Svi statusi", "Čeka uplatu", "Plaćeno", "Prekoračen rok"];

export const INVOICES: Invoice[] = [
  {
    number: "#FAKT-2025/10-88",
    sefId: "981240219",
    lab: "DentalArt Lab Beograd",
    labMeta: "Pravno lice • PIB 103982141",
    orders: [
      { id: "#142", patient: "Jovan Petrović", item: "(Cirkon most 14–17)" },
      { id: "#143", patient: "Ana Simić", item: "(Keramički vinir 21)" },
    ],
    issued: "24.10.2025",
    dueLine: { text: "Rok: 01.11. (još 4 dana)", tone: "urgent", icon: "alarm" },
    amount: "86.400,00",
    amountNet: "72.000,00 bez PDV",
    status: "pending",
    actions: [
      { icon: "qr_code_2", title: "Generiši i plati putem IPS QR koda", kind: "pay" },
      { icon: "download", title: "Preuzmi PDF fakturu", kind: "icon" },
    ],
  },
  {
    number: "#FAKT-2025/10-72",
    sefId: "981189401",
    lab: "Zirkon Centar Kragujevac",
    labMeta: "PIB 107629482",
    orders: [{ id: "#138", patient: "Marko Lukić", item: "(Titanijumski abutment 36)" }],
    issued: "18.10.2025",
    dueLine: { text: "Plaćeno: 24.10.", tone: "muted" },
    amount: "44.200,00",
    amountNet: "36.833,33 bez PDV",
    status: "paid",
    actions: [
      { icon: "visibility", title: "Pregled detalja", kind: "icon" },
      { icon: "download", title: "Preuzmi PDF", kind: "icon" },
    ],
  },
  {
    number: "#FAKT-2025/10-55",
    sefId: "980934110",
    lab: "DentalArt Lab Beograd",
    labMeta: "PIB 103982141",
    orders: [],
    summary: { label: "Zbirna specifikacija", text: "8 naloga (period 01-15.10.)", patients: "Pacijenti: V. Ilić, S. Kostić, N. Đorđević..." },
    issued: "15.10.2025",
    dueLine: { text: "Plaćeno: 15.10. (e-Banking)", tone: "muted" },
    amount: "211.600,00",
    amountNet: "176.333,33 bez PDV",
    status: "paid",
    actions: [
      { icon: "list_alt", title: "Pregled specifikacije", kind: "icon" },
      { icon: "download", title: "Preuzmi PDF", kind: "icon" },
    ],
  },
  {
    number: "#FAKT-2025/09-114",
    sefId: "978901235",
    lab: "Elite Dental Lab Niš",
    labMeta: "PIB 104551920",
    orders: [{ id: "#129", patient: "Katarina Marić", item: "(Skeletirana proteza)" }],
    issued: "30.09.2025",
    dueLine: { text: "Plaćeno: 30.09.", tone: "muted" },
    amount: "32.500,00",
    amountNet: "27.083,33 bez PDV",
    status: "paid",
    actions: [
      { icon: "visibility", title: "Pregled detalja", kind: "icon" },
      { icon: "download", title: "Preuzmi PDF", kind: "icon" },
    ],
  },
];

export const INVOICES_FOOTER = "Prikazano 4 od 24 fakture za period Oktobar 2025";

export const MATERIALS: MaterialUsage[] = [
  { name: "Cirkonijum blokovi (Katana ML)", quantity: "18 jedinica", quantityTone: "text-primary", cost: "198.000 RSD", barClass: "bg-primary", percent: 65 },
  { name: "E.max Presovana keramika", quantity: "12 faseta", quantityTone: "text-tertiary", cost: "144.000 RSD", barClass: "bg-tertiary-container", percent: 45 },
  { name: "Titanijumske baze i šrafovi", quantity: "7 sklopova", quantityTone: "text-secondary", cost: "86.600 RSD", barClass: "bg-secondary", percent: 28 },
];

export const IPS_PAYMENT = {
  invoice: "#FAKT-2025/10-88",
  recipient: "DentalArt Lab d.o.o.",
  account: "160-0000000548912-34",
  amount: "86.400,00 RSD",
  reference: "97 42-1088-2025",
};

export const LAB_SHARES: LabShare[] = [
  { name: "DentalArt Lab Beograd", amount: "291.448 RSD", percent: 68, barClass: "bg-primary" },
  { name: "Zirkon Centar KG", amount: "94.292 RSD", percent: 22, barClass: "bg-tertiary-container" },
  { name: "Ostale laboratorije (Elite)", amount: "42.860 RSD", percent: 10, barClass: "bg-secondary-fixed-dim" },
];

export const SEF_STATUS = {
  syncedAgo: "Pre 12 minuta",
  certificate: "Halcom CA (Važi do 08/2026)",
  xml: "Uključen (UBL 2.1)",
};
