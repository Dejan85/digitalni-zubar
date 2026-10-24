import { formatLongDate } from "./patients-list";
import { MOCK_SERVICE_CATEGORIES, mockServiceExtras, type MockImpressionKind, type MockServiceCategory } from "./orders-mock";
import type { Service } from "./types";

// Izvođenje liste kataloga usluga (KPI, kategorije, filter, redovi) — čista logika bez React-a.
// Šifra, kategorija, rok i otisak su MOCK (vidi mockServiceExtras); naziv, cena i laboratorija su stvarni.

export type CategoryFilter = "" | MockServiceCategory;

export interface CatalogKpis {
  total: number;
  averageLeadDays: number; // MOCK
  digitalPercent: number; // MOCK
  updatedAt: string | null; // stvarno: poslednja izmena bilo koje usluge, npr. "18. Oktobar 2025"
}

export interface CatalogCategoryChip {
  value: CategoryFilter;
  label: string;
  count: number;
}

export interface CatalogRow {
  id: string;
  name: string;
  priceValue: string; // "9.500" (bez valute; valuta je zasebna oznaka u ćeliji)
  technicianName: string;
  code: string;
  categoryLabel: string;
  categoryBadgeClass: string;
  description: string;
  leadText: string;
  leadIsFast: boolean; // brzi rok = primary ikona, sporiji = secondary (kao u dizajnu)
  impression: MockImpressionKind;
}

export interface CatalogData {
  kpis: CatalogKpis;
  chips: CatalogCategoryChip[];
  rows: CatalogRow[]; // filtrirano
}

export const leadDaysText = (days: number) => `${days} ${days === 1 ? "radni dan" : days < 5 ? "radna dana" : "radnih dana"}`;

const isDigital = (kind: MockImpressionKind) => kind !== "analog"; // MOCK: "analogni / digitalni" se računa kao digitalni

export function buildCatalog(
  services: Service[],
  technicianNames: Map<string, string>,
  filters: { category: CategoryFilter; search: string },
): CatalogData {
  const items = services.map((s) => ({ s, mock: mockServiceExtras(s) }));
  const query = filters.search.trim().toLowerCase();

  const rows = items
    .filter((e) => !filters.category || e.mock.category === filters.category)
    .filter(
      (e) =>
        !query ||
        [e.s.name, e.mock.code, e.mock.description, technicianNames.get(e.s.technicianId) ?? ""].some((v) =>
          v.toLowerCase().includes(query),
        ),
    )
    .map(
      ({ s, mock }): CatalogRow => ({
        id: s.id,
        name: s.name,
        priceValue: Number(s.price).toLocaleString("sr-Latn-RS", {
          minimumFractionDigits: Number.isInteger(Number(s.price)) ? 0 : 2,
        }),
        technicianName: technicianNames.get(s.technicianId) ?? "…",
        code: mock.code,
        categoryLabel: MOCK_SERVICE_CATEGORIES.find((c) => c.value === mock.category)!.label,
        categoryBadgeClass: MOCK_SERVICE_CATEGORIES.find((c) => c.value === mock.category)!.badgeClass,
        description: mock.description,
        leadText: leadDaysText(mock.leadDays),
        leadIsFast: mock.leadDays <= 3,
        impression: mock.impression,
      }),
    );

  const chips: CatalogCategoryChip[] = [
    { value: "", label: "Sve kategorije", count: items.length },
    ...MOCK_SERVICE_CATEGORIES.map((c) => ({
      value: c.value,
      label: c.label,
      count: items.filter((e) => e.mock.category === c.value).length,
    })),
  ];

  const lastUpdate = services.reduce<string | null>((max, s) => (max === null || s.updatedAt > max ? s.updatedAt : max), null);
  const total = items.length;
  const kpis: CatalogKpis = {
    total,
    averageLeadDays: total === 0 ? 0 : Math.round((items.reduce((sum, e) => sum + e.mock.leadDays, 0) / total) * 10) / 10,
    digitalPercent: total === 0 ? 0 : Math.round((items.filter((e) => isDigital(e.mock.impression)).length / total) * 100),
    updatedAt: lastUpdate ? formatLongDate(new Date(lastUpdate)) : null,
  };

  return { kpis, chips, rows };
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

// CSV trenutno filtriranih usluga (separator ';' i BOM, da ga srpski Excel otvori ispravno); samo stvarna polja
export function catalogToCsv(rows: CatalogRow[], withTechnician: boolean): string {
  const header = withTechnician ? ["Usluga", "Laboratorija", "Cena (RSD)"] : ["Usluga", "Cena (RSD)"];
  const lines = rows.map((r) => (withTechnician ? [r.name, r.technicianName, r.priceValue] : [r.name, r.priceValue]));
  return "﻿" + [header, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n");
}
