import { shortId } from "./format";
import { mockOrderExtras, type MockOrderExtras } from "./orders-mock";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, ORDER_STATUSES, type StatusTone } from "./order-status";
import type { CompanyType, Order, OrderStatus } from "./types";

// Izvođenje liste porudžbina (filteri, čipovi, KPI) nad već učitanim porudžbinama — čista logika bez React-a.

const CLOSED: OrderStatus[] = ["isporucena", "otkazana", "odbijena"];
const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS);
const daysText = (n: number) => `${n} ${n === 1 ? "dan" : "dana"}`;

export type DateRange = "all" | "this_month" | "last_30";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Svi datumi" },
  { value: "this_month", label: "Ovaj mesec" },
  { value: "last_30", label: "Poslednjih 30 dana" },
];

export interface OrdersFilters {
  status: OrderStatus | "";
  search: string;
  partnerId: string;
  dateRange: DateRange;
}

export const EMPTY_FILTERS: OrdersFilters = { status: "", search: "", partnerId: "", dateRange: "all" };

export const hasActiveFilters = (f: OrdersFilters) =>
  f.status !== "" || f.search.trim() !== "" || f.partnerId !== "" || f.dateRange !== "all";

export interface OrdersKpi {
  label: string;
  value: string;
  unit: string;
  unitIcon?: string;
  icon: string;
  tone: "default" | "error" | "primary" | "tertiary";
}

export interface StatusChip {
  key: OrderStatus | "";
  label: string;
  count: number;
}

export interface OrderListRow {
  id: string;
  shortId: string;
  patientName: string;
  patientInitials: string;
  partnerName: string;
  statusLabel: string;
  statusTone: StatusTone;
  deadline: string;
  deadlineHint: string;
  deadlineTone: "overdue" | "soon" | "normal" | "done";
  createdAt: string;
  isUrgent: boolean; // aktivna porudžbina sa rokom za manje od 48h (ili probijenim)
  needsAttention: boolean; // vraćena na doradu
  mock: MockOrderExtras; // MOCK polja iz dizajna (vidi orders-mock.ts)
}

export interface OrdersListData {
  kpis: OrdersKpi[];
  chips: StatusChip[];
  partners: { id: string; name: string }[];
  rows: OrderListRow[]; // filtrirano, sortirano od najnovije
  totalCount: number; // bez filtera
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export const patientNameOf = (o: Order) => `${o.patientFirstName ?? ""} ${o.patientLastName ?? ""}`.trim() || "—";

const fmtDate = (d: Date) => d.toLocaleDateString("sr-Latn-RS", { day: "2-digit", month: "short", year: "numeric" });

function deadlineInfo(o: Order, today: Date): Pick<OrderListRow, "deadline" | "deadlineHint" | "deadlineTone" | "isUrgent"> {
  if (!o.deliveryDeadline) return { deadline: "—", deadlineHint: "", deadlineTone: "normal", isUrgent: false };
  const d = new Date(o.deliveryDeadline);
  const deadline = fmtDate(d);
  if (o.status === "isporucena") return { deadline, deadlineHint: "Završeno", deadlineTone: "done", isUrgent: false };
  if (CLOSED.includes(o.status)) return { deadline, deadlineHint: "", deadlineTone: "normal", isUrgent: false };
  const left = dayDiff(d, today);
  if (left < 0) return { deadline, deadlineHint: `Kasni ${daysText(-left)}`, deadlineTone: "overdue", isUrgent: true };
  if (left === 0) return { deadline, deadlineHint: "Danas", deadlineTone: "soon", isUrgent: true };
  if (left === 1) return { deadline, deadlineHint: "Za 24 sata", deadlineTone: "soon", isUrgent: true };
  return { deadline, deadlineHint: `Za ${daysText(left)}`, deadlineTone: "normal", isUrgent: false };
}

function matchesDateRange(o: Order, range: DateRange, today: Date): boolean {
  if (range === "all") return true;
  const created = startOfDay(new Date(o.createdAt));
  if (range === "this_month") {
    return created.getFullYear() === today.getFullYear() && created.getMonth() === today.getMonth();
  }
  return dayDiff(today, created) <= 30;
}

export function buildOrdersList(
  orders: Order[],
  companyType: CompanyType,
  filters: OrdersFilters,
  now: Date = new Date(),
): OrdersListData {
  const today = startOfDay(now);
  const isDoctor = companyType === "doktor";
  const partnerIdOf = (o: Order) => (isDoctor ? o.technicianId : o.doctorId);
  const partnerNameOf = (o: Order) => (isDoctor ? o.technicianName : o.doctorName) ?? "—";

  const toRow = (o: Order): OrderListRow => {
    const patientName = patientNameOf(o);
    const dl = deadlineInfo(o, today);
    return {
      id: o.id,
      shortId: shortId(o.id),
      patientName,
      patientInitials: initials(patientName) || "—",
      partnerName: partnerNameOf(o),
      statusLabel: ORDER_STATUS_LABELS[o.status],
      statusTone: ORDER_STATUS_TONES[o.status],
      ...dl,
      createdAt: fmtDate(new Date(o.createdAt)),
      needsAttention: o.status === "vracena_na_doradu",
      mock: mockOrderExtras(o, partnerNameOf(o)),
    };
  };

  // KPI i brojevi na čipovima se računaju nad svim porudžbinama, filteri sužavaju samo tabelu
  const active = orders.filter((o) => !CLOSED.includes(o.status));
  const urgent = active.filter((o) => deadlineInfo(o, today).isUrgent).length;
  const rework = orders.filter((o) => o.status === "vracena_na_doradu").length;
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const createdThisWeek = orders.filter((o) => startOfDay(new Date(o.createdAt)) >= weekStart).length;
  // 3D udeo je mock (tip otiska nije u listi); prosek izrade je stvaran: kreirana → poslednja izmena isporučenih
  const digital = orders.filter((o) => mockOrderExtras(o, partnerNameOf(o)).impression.kind === "digital").length;
  const delivered = orders.filter((o) => o.status === "isporucena");
  const avgDays = delivered.length
    ? delivered.reduce((sum, o) => sum + dayDiff(new Date(o.updatedAt), new Date(o.createdAt)), 0) / delivered.length
    : null;
  const kpis: OrdersKpi[] = [
    {
      label: "Aktivne porudžbine",
      value: String(active.length),
      unit: `+${createdThisWeek} ove nedelje`,
      unitIcon: "trending_up",
      icon: "precision_manufacturing",
      tone: "primary",
    },
    { label: "Hitne dorade & probe", value: String(urgent + rework), unit: "Rok < 48h", unitIcon: "priority_high", icon: "alarm", tone: "error" },
    {
      label: "Digitalni 3D skenovi",
      value: orders.length ? `${Math.round((digital / orders.length) * 100)}%` : "—",
      unit: `${digital}/${orders.length} radova`,
      icon: "view_in_ar",
      tone: "tertiary",
    },
    {
      label: "Prosečno vreme izrade",
      value: avgDays === null ? "—" : avgDays.toFixed(1),
      unit: "dana",
      icon: "timer",
      tone: "default",
    },
  ];

  // kao u mock-u: svi aktivni statusi uvek (i sa 0); otkazana/odbijena tek kad ih ima ili je filter izabran
  const chips: StatusChip[] = [
    { key: "", label: "Sve", count: orders.length },
    ...ORDER_STATUSES.map((s) => ({
      key: s,
      label: ORDER_STATUS_LABELS[s],
      count: orders.filter((o) => o.status === s).length,
    })).filter((c) => c.count > 0 || c.key === filters.status || !["otkazana", "odbijena"].includes(c.key)),
  ];

  const partners = [...new Map(orders.map((o) => [partnerIdOf(o), partnerNameOf(o)])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "sr-Latn"));

  const query = filters.search.trim().toLowerCase().replace(/^#/, "");
  const filtered = orders
    .filter((o) => !filters.status || o.status === filters.status)
    .filter((o) => !filters.partnerId || partnerIdOf(o) === filters.partnerId)
    .filter((o) => matchesDateRange(o, filters.dateRange, today))
    .filter(
      (o) =>
        !query ||
        [o.id, patientNameOf(o), partnerNameOf(o)].some((value) => value.toLowerCase().includes(query)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { kpis, chips, partners, rows: filtered.map(toRow), totalCount: orders.length };
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

// CSV trenutno filtriranih redova (separator ';' i BOM, da ga srpski Excel otvori ispravno)
export function ordersToCsv(rows: OrderListRow[], partnerHeader: string): string {
  const header = ["Br. porudžbine", "Pacijent", partnerHeader, "Status", "Rok isporuke", "Datum kreiranja"];
  const lines = rows.map((r) => [r.shortId, r.patientName, r.partnerName, r.statusLabel, r.deadline, r.createdAt]);
  return "﻿" + [header, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n");
}
