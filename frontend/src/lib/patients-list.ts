import { shortId } from "./format";
import { initials, patientNameOf } from "./orders-list";
import { mockOrderExtras, mockPatientExtras, type MockPatientExtras } from "./orders-mock";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type StatusTone } from "./order-status";
import type { Order, OrderStatus, Patient } from "./types";

// Izvođenje liste pacijenata (KPI, filteri, redovi) iz pacijenata i porudžbina — čista logika bez React-a.

const CLOSED: OrderStatus[] = ["isporucena", "otkazana", "odbijena"];
const DAY_MS = 86_400_000;
const MONTHS = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];

export type GenderFilter = "" | "M" | "Z";
export type ProstheticsFilter = "" | "active" | "ready" | "done" | "none";
export type AgeGroup = "" | "u25" | "26-45" | "46-65" | "65+";

export interface PatientsFilters {
  search: string;
  gender: GenderFilter;
  prosthetics: ProstheticsFilter;
  ageGroup: AgeGroup;
}

export const EMPTY_PATIENT_FILTERS: PatientsFilters = { search: "", gender: "", prosthetics: "", ageGroup: "" };

export const hasActivePatientFilters = (f: PatientsFilters) =>
  f.search.trim() !== "" || f.gender !== "" || f.prosthetics !== "" || f.ageGroup !== "";

export const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: "", label: "Pol: Svi" },
  { value: "M", label: "Muški" },
  { value: "Z", label: "Ženski" },
];

export const PROSTHETICS_OPTIONS: { value: ProstheticsFilter; label: string }[] = [
  { value: "", label: "Status protetike: Svi" },
  { value: "active", label: "Aktivan rad u labu" },
  { value: "ready", label: "Spremno za probu" },
  { value: "done", label: "Završeni radovi" },
  { value: "none", label: "Nema aktivnih naloga" },
];

export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "", label: "Starosna grupa: Sve" },
  { value: "u25", label: "Mlađi od 25" },
  { value: "26-45", label: "26 - 45 god" },
  { value: "46-65", label: "46 - 65 god" },
  { value: "65+", label: "65+ god" },
];

export interface PatientsKpis {
  total: number;
  newThisMonth: number;
  newThisMonthPercent: number | null; // u odnosu na broj pacijenata pre ovog meseca
  activeWorks: number; // aktivne porudžbine (primljena → poslata, vraćena na doradu)
  inLab: number; // od toga u izradi
  waitingHandover: number; // poslata (čeka probu/predaju)
  dueThisWeek: number; // aktivne sa rokom u narednih 7 dana
}

export interface PatientRowWork {
  orderLabel: string; // "Nalog #6e1a64a1"
  statusLabel: string;
  statusTone: StatusTone;
  description: string; // MOCK (usluga i zubi nisu u listi porudžbina)
}

export interface PatientRow {
  id: string;
  fullName: string;
  initials: string;
  avatarTone: number; // indeks boje avatara (0–5)
  genderLetter: "M" | "Ž";
  ageText: string;
  work: PatientRowWork | null;
  ordersCountText: string;
  lastEntry: string;
  mock: MockPatientExtras;
}

export interface PatientsListData {
  kpis: PatientsKpis;
  rows: PatientRow[]; // filtrirano, sortirano po poslednjem unosu (najnoviji prvi)
  totalCount: number; // bez filtera
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function ageOf(birthDate: string, now: Date): number {
  const born = new Date(birthDate);
  let age = now.getFullYear() - born.getFullYear();
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) age -= 1;
  return age;
}

function matchesAgeGroup(age: number, group: AgeGroup): boolean {
  switch (group) {
    case "u25":
      return age < 25;
    case "26-45":
      return age >= 26 && age <= 45;
    case "46-65":
      return age >= 46 && age <= 65;
    case "65+":
      return age >= 65;
    default:
      return true;
  }
}

// "24. Oktobar 2025"
export const formatLongDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const ordersCountText = (n: number) => `${n} ${n === 1 ? "nalog" : "naloga"}`;

// istaknuti nalog pacijenta: najnoviji aktivan, a ako ga nema najnoviji uopšte
function featuredOrder(orders: Order[]): Order | null {
  const newest = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return newest.find((o) => !CLOSED.includes(o.status)) ?? newest[0] ?? null;
}

function prostheticsOf(order: Order | null): Exclude<ProstheticsFilter, ""> {
  if (!order) return "none";
  if (order.status === "poslata") return "ready";
  if (order.status === "isporucena") return "done";
  if (CLOSED.includes(order.status)) return "none";
  return "active";
}

function mockWorkDescription(order: Order): string {
  const { service } = mockOrderExtras(order, patientNameOf(order));
  return service.tag ? `${service.title} (${service.tag.replace(/^FDI:\s*/, "FDI ")})` : service.title;
}

export function buildPatientsList(
  patients: Patient[],
  orders: Order[],
  filters: PatientsFilters,
  now: Date = new Date(),
): PatientsListData {
  const today = startOfDay(now);
  const ordersByPatient = new Map<string, Order[]>();
  for (const o of orders) ordersByPatient.set(o.patientId, [...(ordersByPatient.get(o.patientId) ?? []), o]);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const newThisMonth = patients.filter((p) => new Date(p.createdAt) >= monthStart).length;
  const before = patients.length - newThisMonth;
  const activeOrders = orders.filter((o) => !CLOSED.includes(o.status));
  const kpis: PatientsKpis = {
    total: patients.length,
    newThisMonth,
    newThisMonthPercent: before > 0 ? Math.round((newThisMonth / before) * 1000) / 10 : null,
    activeWorks: activeOrders.length,
    inLab: orders.filter((o) => o.status === "u_izradi").length,
    waitingHandover: orders.filter((o) => o.status === "poslata").length,
    dueThisWeek: activeOrders.filter((o) => {
      if (!o.deliveryDeadline) return false;
      const left = Math.round((startOfDay(new Date(o.deliveryDeadline)).getTime() - today.getTime()) / DAY_MS);
      return left >= 0 && left <= 7;
    }).length,
  };

  const query = filters.search.trim().toLowerCase().replace(/^#/, "");
  const rows = patients
    .map((p) => {
      const own = ordersByPatient.get(p.id) ?? [];
      return {
        p,
        own,
        featured: featuredOrder(own),
        lastActivity: own.reduce((max, o) => (o.createdAt > max ? o.createdAt : max), p.updatedAt),
        fullName: `${p.firstName} ${p.lastName}`,
        mock: mockPatientExtras(p),
        age: ageOf(p.birthDate, now),
      };
    })
    .filter((e) => !filters.gender || e.p.gender === filters.gender)
    .filter((e) => !filters.prosthetics || prostheticsOf(e.featured) === filters.prosthetics)
    .filter((e) => matchesAgeGroup(e.age, filters.ageGroup))
    .filter(
      (e) =>
        !query ||
        [e.fullName, e.mock.recordNumber, e.mock.jmbg].some((value) => value.toLowerCase().replace(/^#/, "").includes(query)),
    )
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    .map(
      (e): PatientRow => ({
        id: e.p.id,
        fullName: e.fullName,
        initials: initials(e.fullName) || "—",
        avatarTone: (parseInt(e.p.id.slice(0, 4), 16) || 0) % 6,
        genderLetter: e.p.gender === "M" ? "M" : "Ž",
        ageText: `${e.age} god`,
        work: e.featured
          ? {
              orderLabel: `Nalog #${shortId(e.featured.id)}`,
              statusLabel: ORDER_STATUS_LABELS[e.featured.status],
              statusTone: ORDER_STATUS_TONES[e.featured.status],
              description: mockWorkDescription(e.featured),
            }
          : null,
        ordersCountText: ordersCountText(e.own.length),
        lastEntry: formatLongDate(new Date(e.lastActivity)),
        mock: e.mock,
      }),
    );

  return { kpis, rows, totalCount: patients.length };
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

// CSV trenutno filtriranih pacijenata (separator ';' i BOM, da ga srpski Excel otvori ispravno); samo stvarna polja
export function patientsToCsv(rows: PatientRow[]): string {
  const header = ["Pacijent", "Pol", "Starost", "Ukupno naloga", "Poslednji unos"];
  const lines = rows.map((r) => [r.fullName, r.genderLetter, r.ageText, r.ordersCountText, r.lastEntry]);
  return "﻿" + [header, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n");
}
