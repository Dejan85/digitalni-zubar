import { shortId } from "./format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type StatusTone } from "./order-status";
import type { CompanyType, Order, OrderStatus } from "./types";

// Izvođenje podataka za kontrolnu tablu iz liste porudžbina (bez novog backend endpointa) — čista logika bez React-a.

// završna stanja: porudžbina više nije "u toku"
const CLOSED: OrderStatus[] = ["isporucena", "otkazana", "odbijena"];
const isActive = (o: Order) => !CLOSED.includes(o.status);

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const fmt = (d: Date, options: Intl.DateTimeFormatOptions) => d.toLocaleDateString("sr-Latn-RS", options);
const daysText = (n: number) => `${n} ${n === 1 ? "dan" : "dana"}`;

export interface KpiItem {
  label: string;
  value: number;
  unit: string;
  icon: string;
  footerLeft: string;
  footerRight?: string;
  isAttention?: boolean; // pulsirajuća tačka u footeru (zahteva akciju)
  href?: string;
}

export interface WeekDay {
  key: string;
  weekday: string;
  day: number;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  dots: number;
}

export interface DeadlineItem {
  id: string;
  patientName: string;
  counterpartName: string;
  statusLabel: string;
  statusTone: StatusTone;
}

export interface DeadlineGroup {
  key: string;
  title: string;
  countLabel: string;
  tone: "today" | "soon" | "later";
  items: DeadlineItem[];
}

export type RecentFilter = "all" | "u_izradi" | "poslata" | "vracena_na_doradu" | "isporucena";

export interface RecentRow {
  id: string;
  patientName: string;
  counterpartName: string;
  deadline: string;
  deadlineHint: string;
  deadlineTone: "overdue" | "soon" | "normal";
  counterpartInitials: string;
  action: { label: string; kind: "details" | "track" | "review" | "rework" };
  statusLabel: string;
  statusTone: StatusTone;
}

export interface AlertItem {
  id: string;
  kind: "urgent" | "rework" | "info";
  badge: string;
  title: string;
  text: string;
  href: string;
}

export interface DashboardData {
  monthLabel: string;
  weekNumber: number;
  weekLabel: string;
  weekDays: WeekDay[];
  kpis: KpiItem[];
  deadlineGroups: DeadlineGroup[];
  recentFilters: { key: RecentFilter; label: string; count: number }[];
  recentRows: Record<RecentFilter, RecentRow[]>;
  alerts: AlertItem[];
}

const RECENT_FILTERS: { key: RecentFilter; label: string }[] = [
  { key: "all", label: "Sve" },
  { key: "u_izradi", label: "U izradi" },
  { key: "poslata", label: "Poslato" },
  { key: "vracena_na_doradu", label: "Dorada" },
  { key: "isporucena", label: "Isporučeno" },
];

const initials = (name: string) =>
  name
    .split(/s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// akcija u tabeli zavisi od stanja (kao u dizajn/code.html: Prati / Pregled / Komentar / Detalji)
const ROW_ACTION: Record<string, RecentRow["action"]> = {
  default: { label: "Detalji", kind: "details" },
  poslata: { label: "Prati", kind: "track" },
  isporucena: { label: "Pregled", kind: "review" },
  vracena_na_doradu: { label: "Komentar", kind: "rework" },
};

// ISO broj sedmice (četvrtak određuje sedmicu)
function isoWeek(d: Date): number {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const firstThursday = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t.getTime() - firstThursday.getTime()) / DAY_MS - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

const patientName = (o: Order) => `${o.patientFirstName ?? ""} ${o.patientLastName ?? ""}`.trim() || "—";

export function buildDashboard(
  orders: Order[],
  companyType: CompanyType,
  pendingRequests: number,
  now: Date = new Date(),
): DashboardData {
  const today = startOfDay(now);
  const counterpart = (o: Order) => (companyType === "doktor" ? o.technicianName : o.doctorName) ?? "—";
  const deadlineOf = (o: Order) => (o.deliveryDeadline ? new Date(o.deliveryDeadline) : null);
  const daysLeft = (o: Order) => {
    const d = deadlineOf(o);
    return d ? dayDiff(d, today) : null;
  };

  const active = orders.filter(isActive);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const sunday = addDays(monday, 6);

  // --- KPI kartice
  const awaitingConfirmation = orders.filter((o) => o.status === "primljena").length;
  const dueSoon = active.filter((o) => {
    const left = daysLeft(o);
    return left !== null && left >= 0 && left <= 6;
  });
  const dueToday = dueSoon.filter((o) => daysLeft(o) === 0).length;
  const overdue = active.filter((o) => (daysLeft(o) ?? 0) < 0).length;
  const createdThisWeek = orders.filter((o) => {
    const created = startOfDay(new Date(o.createdAt));
    return created >= monday && created <= sunday;
  }).length;

  const isDoctor = companyType === "doktor";
  const kpis: KpiItem[] = [
    {
      label: "Aktivne porudžbine",
      value: active.length,
      unit: "radova",
      icon: "view_in_ar",
      footerLeft: `+${createdThisWeek} ove nedelje`,
      footerRight: `${active.filter((o) => o.status === "u_izradi").length} u izradi`,
      href: "/orders",
    },
    {
      label: isDoctor ? "Čeka potvrdu laboratorije" : "Čeka vašu potvrdu",
      value: awaitingConfirmation,
      unit: "porudžbina",
      icon: "hourglass_top",
      footerLeft:
        awaitingConfirmation === 0 ? "Sve potvrđeno" : isDoctor ? "Čeka se laboratorija" : "Akcija potrebna",
      isAttention: awaitingConfirmation > 0 && !isDoctor,
      href: "/orders",
    },
    {
      label: "Rokovi u narednih 7 dana",
      value: dueSoon.length,
      unit: "isporuka",
      icon: "local_shipping",
      footerLeft: dueToday > 0 ? `${dueToday} danas` : "Nema rokova danas",
      footerRight: overdue > 0 ? `${overdue} kasni` : undefined,
      isAttention: overdue > 0,
    },
    {
      label: "Zahtevi za povezivanje",
      value: pendingRequests,
      unit: "zahteva",
      icon: "hub",
      footerLeft: pendingRequests > 0 ? "Čeka odgovor" : "Nema novih zahteva",
      isAttention: pendingRequests > 0,
      href: "/connections",
    },
  ];

  // --- traka tekuće sedmice
  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const count = active.filter((o) => {
      const d = deadlineOf(o);
      return d && dayDiff(d, date) === 0;
    }).length;
    return {
      key: String(i),
      weekday: fmt(date, { weekday: "short" }),
      day: date.getDate(),
      isToday: dayDiff(date, today) === 0,
      isPast: dayDiff(date, today) < 0,
      isWeekend: i >= 5,
      dots: Math.min(count, 2),
    };
  });
  const weekLabel = `${fmt(monday, { day: "numeric", month: "short" })} – ${fmt(sunday, { day: "numeric", month: "short" })}`;

  // --- rokovi narednih 14 dana, grupisani po danu
  const groups = new Map<number, Order[]>();
  for (const o of active) {
    const left = daysLeft(o);
    if (left === null || left < 0 || left > 13) continue;
    groups.set(left, [...(groups.get(left) ?? []), o]);
  }
  const deadlineGroups: DeadlineGroup[] = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([left, list]) => {
      const dateText = fmt(addDays(today, left), { weekday: "short", day: "numeric", month: "long" });
      return {
        key: String(left),
        title: left === 0 ? `Danas (${dateText})` : left === 1 ? `Sutra (${dateText})` : dateText,
        countLabel: `${list.length} ${list.length === 1 ? "rad" : "radova"}`,
        tone: left === 0 ? "today" : left === 1 ? "soon" : "later",
        items: list.map((o) => ({
          id: o.id,
          patientName: patientName(o),
          counterpartName: counterpart(o),
          statusLabel: ORDER_STATUS_LABELS[o.status],
          statusTone: ORDER_STATUS_TONES[o.status],
        })),
      };
    });

  // --- poslednje porudžbine (redosled kao sa API-ja)
  const toRow = (o: Order): RecentRow => {
    const left = daysLeft(o);
    const d = deadlineOf(o);
    let hint = "";
    let tone: RecentRow["deadlineTone"] = "normal";
    if (d && left !== null && isActive(o)) {
      if (left < 0) {
        hint = `Kasni ${daysText(-left)}`;
        tone = "overdue";
      } else if (left === 0) {
        hint = "Danas";
        tone = "soon";
      } else if (left === 1) {
        hint = "Sutra";
        tone = "soon";
      } else {
        hint = `Za ${daysText(left)}`;
      }
    }
    return {
      id: o.id,
      patientName: patientName(o),
      counterpartName: counterpart(o),
      deadline: d ? fmt(d, { day: "numeric", month: "short" }) : "—",
      deadlineHint: hint,
      deadlineTone: tone,
      counterpartInitials: initials(counterpart(o)),
      action: ROW_ACTION[o.status] ?? ROW_ACTION.default,
      statusLabel: ORDER_STATUS_LABELS[o.status],
      statusTone: ORDER_STATUS_TONES[o.status],
    };
  };
  const recentRows = Object.fromEntries(
    RECENT_FILTERS.map(({ key }) => [
      key,
      orders
        .filter((o) => key === "all" || o.status === key)
        .slice(0, 6)
        .map(toRow),
    ]),
  ) as Record<RecentFilter, RecentRow[]>;
  const recentFilters = RECENT_FILTERS.map(({ key, label }) => ({
    key,
    label,
    count: key === "all" ? orders.length : orders.filter((o) => o.status === key).length,
  }));

  // --- alarmi izvedeni iz stanja porudžbina (backend nema globalnu listu alarma, vidi TASKS.md F9)
  const alerts: AlertItem[] = [];
  for (const o of active) {
    const left = daysLeft(o);
    if (left === null || left > 2) continue;
    const when = left < 0 ? `kasni ${daysText(-left)}` : left === 0 ? "ističe danas" : `ističe za ${daysText(left)}`;
    alerts.push({
      id: `deadline-${o.id}`,
      kind: "urgent",
      badge: left < 0 ? "Rok istekao" : "Hitan rok",
      title: `Rok isporuke za rad #${shortId(o.id)} ${when}`,
      text: `Pacijent: ${patientName(o)} • ${counterpart(o)}`,
      href: `/orders/${o.id}`,
    });
  }
  for (const o of orders) {
    if (o.status === "vracena_na_doradu") {
      alerts.push({
        id: `rework-${o.id}`,
        kind: "rework",
        badge: "Vraćeno na doradu",
        title: `Rad #${shortId(o.id)} je vraćen na doradu`,
        text: `Pacijent: ${patientName(o)} • ${counterpart(o)}`,
        href: `/orders/${o.id}`,
      });
    } else if (o.status === "primljena" && !isDoctor) {
      alerts.push({
        id: `new-${o.id}`,
        kind: "info",
        badge: "Nova porudžbina",
        title: `Porudžbina #${shortId(o.id)} čeka potvrdu`,
        text: `Pacijent: ${patientName(o)} • ${counterpart(o)}`,
        href: `/orders/${o.id}`,
      });
    }
  }
  const rank = { urgent: 0, rework: 1, info: 2 };
  alerts.sort((a, b) => rank[a.kind] - rank[b.kind]);

  const month = fmt(today, { month: "long" });
  const monthLabel = `${month.charAt(0).toUpperCase()}${month.slice(1)} ${today.getFullYear()}`;

  return { monthLabel, weekNumber: isoWeek(today), weekLabel, weekDays, kpis, deadlineGroups, recentFilters, recentRows, alerts: alerts.slice(0, 6) };
}
