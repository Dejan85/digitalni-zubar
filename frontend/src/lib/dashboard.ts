import { shortId } from "./format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type StatusTone } from "./order-status";
import { initials, patientNameOf } from "./orders-list";
import { mockDashboardExtras, mockOrderExtras } from "./orders-mock";
import type { CompanyType, Order, OrderStatus } from "./types";

// Izvođenje podataka za kontrolnu tablu iz liste porudžbina (bez novog backend endpointa) — čista logika bez React-a.
// Polja označena MOCK dolaze iz lib/orders-mock.ts (backend ih nema); spisak: documentation/TASKS.md → "Mock podaci na kontrolnoj tabli".

// završna stanja: porudžbina više nije "u toku"
const CLOSED: OrderStatus[] = ["isporucena", "otkazana", "odbijena"];
const isActive = (o: Order) => !CLOSED.includes(o.status);

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const fmt = (d: Date, options: Intl.DateTimeFormatOptions) => d.toLocaleDateString("sr-Latn-RS", options);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const daysText = (n: number) => `${n} ${n === 1 ? "dan" : "dana"}`;
// "1 rad", "2 rada", "5 radova"
const worksText = (n: number) => `${n} ${n === 1 ? "rad" : n < 5 ? "rada" : "radova"}`;

export interface KpiFooterLeft {
  text: string;
  icon?: string; // ikona ispred teksta
  dot?: "pulse" | "static"; // tačka ispred teksta (pulsira = zahteva akciju)
  chip?: boolean; // tekst u "čipu" (kao "2 rada danas" u mock-u)
}

export interface KpiItem {
  label: string;
  value: number;
  unit: string;
  icon: string;
  footerLeft: KpiFooterLeft;
  footerRight?: { text: string; href?: string };
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
  title: string; // MOCK: usluga (+ zubi)
  subtitle: string; // "Pacijent: X • Lab Y"
  timeLabel: string; // "Danas do 14:00h" (MOCK vreme) / "Za 24h"
  courierNote?: string; // MOCK: "Kurir preuzeo u 10:15h" — samo za poslate
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
  recordNumber: string; // MOCK
  counterpartName: string;
  deadline: string;
  deadlineHint: string;
  deadlineTone: "overdue" | "soon" | "normal";
  counterpartInitials: string;
  serviceTitle: string; // MOCK
  serviceDetail: string; // MOCK
  action: { label: string; kind: "details" | "track" | "review" | "rework" };
  statusLabel: string;
  statusTone: StatusTone;
}

export interface AlertItem {
  id: string;
  kind: "urgent" | "rework" | "info";
  badge: string;
  timeAgo: string; // stvarno, iz updatedAt porudžbine
  title: string;
  text: string;
  footerNote?: string; // npr. "Korisnik: Lab DentalArt" (info kartica)
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

// "Pre 25 min", "Pre 1h 10m", "Pre 3h", "Pre 2 dana"
function timeAgo(iso: string, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "Upravo sada";
  if (minutes < 60) return `Pre ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 === 0 ? `Pre ${hours}h` : `Pre ${hours}h ${minutes % 60}m`;
  return `Pre ${daysText(Math.floor(hours / 24))}`;
}

// usluga za prikaz u naslovu kartice: "Zirconia krunica (FDI: 14, 15)"
const serviceLabel = (s: { title: string; tag?: string }) => (s.tag ? `${s.title} (${s.tag})` : s.title);

export function buildDashboard(
  orders: Order[],
  companyType: CompanyType,
  pendingRequests: number,
  now: Date = new Date(),
): DashboardData {
  const today = startOfDay(now);
  const isDoctor = companyType === "doktor";
  const counterpart = (o: Order) => (isDoctor ? o.technicianName : o.doctorName) ?? "—";
  const deadlineOf = (o: Order) => (o.deliveryDeadline ? new Date(o.deliveryDeadline) : null);
  const daysLeft = (o: Order) => {
    const d = deadlineOf(o);
    return d ? dayDiff(d, today) : null;
  };
  const patientName = (o: Order) => patientNameOf(o);

  const active = orders.filter(isActive);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const sunday = addDays(monday, 6);

  // --- KPI kartice
  const awaitingConfirmation = orders.filter((o) => o.status === "primljena");
  const dueThisWeek = active.filter((o) => {
    const d = deadlineOf(o);
    return d !== null && d >= monday && startOfDay(d) <= sunday;
  });
  const dueToday = active.filter((o) => daysLeft(o) === 0).length;
  const overdue = active.filter((o) => (daysLeft(o) ?? 0) < 0).length;
  const createdThisWeek = orders.filter((o) => {
    const created = startOfDay(new Date(o.createdAt));
    return created >= monday && created <= sunday;
  }).length;

  const kpis: KpiItem[] = [
    {
      label: "Aktivne porudžbine",
      value: active.length,
      unit: "radova",
      icon: "view_in_ar",
      footerLeft: { text: `+${createdThisWeek} ove nedelje`, icon: "trending_up" },
      footerRight: { text: `${active.filter((o) => o.status === "u_izradi").length} u izradi` },
      href: "/orders",
    },
    {
      label: isDoctor ? "Čeka potvrdu laboratorije" : "Čeka vašu potvrdu",
      value: awaitingConfirmation.length,
      unit: "digitalna STL", // MOCK: sve se prikazuje kao digitalno, backend nema tip otiska u listi
      icon: "hourglass_top",
      footerLeft: {
        text: awaitingConfirmation.length === 0 ? "Sve potvrđeno" : isDoctor ? "Akcija potrebna (Lab)" : "Akcija potrebna",
        dot: awaitingConfirmation.length > 0 ? "pulse" : undefined,
      },
      footerRight: { text: "Prosek: 3.2h" }, // MOCK: konstanta, backend ne meri vreme odgovora laboratorije
      href: "/orders",
    },
    {
      label: "Rok isporuke ove nedelje",
      value: dueThisWeek.length,
      unit: "isporuka",
      icon: "local_shipping",
      footerLeft: {
        text: dueToday > 0 ? `${worksText(dueToday)} danas` : overdue > 0 ? `${overdue} kasni` : "Nema rokova danas",
        icon: "notifications_active",
        chip: true,
      },
      footerRight: { text: "Termini spremni" }, // MOCK: statična oznaka
    },
    {
      label: "Novi zahtevi za povezivanje",
      value: pendingRequests,
      unit: "zahteva",
      icon: "hub",
      footerLeft: {
        text: isDoctor ? "Nova laboratorija" : "Nova ordinacija",
        dot: "static",
      },
      footerRight: { text: "Pregledaj", href: "/connections" },
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
      const date = addDays(today, left);
      const dayText = `${date.getDate()}. ${cap(fmt(date, { month: "long" }))}`;
      const toItem = (o: Order): DeadlineItem => {
        const patient = patientName(o);
        const extras = mockDashboardExtras(o, initials(patient));
        return {
          id: o.id,
          title: serviceLabel(mockOrderExtras(o, counterpart(o)).service),
          subtitle: `Pacijent: ${patient} • ${isDoctor ? "Lab " : ""}${counterpart(o)}`,
          timeLabel: left === 0 ? `Danas do ${extras.deliveryTime}h` : left === 1 ? "Za 24h" : `Za ${daysText(left)}`,
          courierNote: o.status === "poslata" ? `Kurir preuzeo u ${extras.courierTime}h` : undefined,
          statusLabel: ORDER_STATUS_LABELS[o.status],
          statusTone: ORDER_STATUS_TONES[o.status],
        };
      };
      return {
        key: String(left),
        title:
          left === 0
            ? `Danas (${cap(fmt(date, { weekday: "short" }))}, ${dayText})`
            : left === 1
              ? `Sutra (${cap(fmt(date, { weekday: "short" }))}, ${dayText})`
              : `${cap(fmt(date, { weekday: "long" }))} (${dayText})`,
        countLabel: left === 0 ? `${worksText(list.length)} ${list.length === 1 ? "očekivan" : "očekivana"}` : left === 1 ? worksText(list.length) : `${list.length} zakazana rada`,
        tone: left === 0 ? "today" : left === 1 ? "soon" : "later",
        items: list.map(toItem),
      };
    });

  // --- poslednje porudžbine (redosled kao sa API-ja)
  const toRow = (o: Order): RecentRow => {
    const left = daysLeft(o);
    const d = deadlineOf(o);
    const patient = patientName(o);
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
    const service = mockOrderExtras(o, counterpart(o)).service;
    return {
      id: o.id,
      patientName: patient,
      recordNumber: mockDashboardExtras(o, initials(patient)).recordNumber,
      counterpartName: counterpart(o),
      deadline: d ? `${fmt(d, { day: "numeric" })}. ${cap(fmt(d, { month: "short" }))}` : "—",
      deadlineHint: hint,
      deadlineTone: tone,
      counterpartInitials: initials(counterpart(o)),
      serviceTitle: service.title,
      serviceDetail: [service.tag, service.detail].filter(Boolean).join(" • "),
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
      timeAgo: timeAgo(o.updatedAt, now),
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
        badge: "Napomena za doradu",
        timeAgo: timeAgo(o.updatedAt, now),
        title: `Rad #${shortId(o.id)} je vraćen na doradu`,
        text: `Pacijent: ${patientName(o)} • ${counterpart(o)}`,
        href: `/orders/${o.id}`,
      });
    } else if (o.status === "potvrdjena" && isDoctor) {
      const deadline = deadlineOf(o);
      alerts.push({
        id: `accepted-${o.id}`,
        kind: "info",
        badge: "Lab prihvatila",
        timeAgo: timeAgo(o.updatedAt, now),
        title: `${counterpart(o)}: ${deadline ? "Određen rok" : "Porudžbina potvrđena"} za #${shortId(o.id)}`,
        text: `Laboratorija ${counterpart(o)} je prihvatila porudžbinu #${shortId(o.id)} (${patientName(o)})${
          deadline ? ` i odredila predviđeni rok za ${deadline.toLocaleDateString("sr-Latn-RS")}` : ""
        }.`,
        footerNote: `Laboratorija: ${counterpart(o)}`,
        href: `/orders/${o.id}`,
      });
    } else if (o.status === "primljena" && !isDoctor) {
      alerts.push({
        id: `new-${o.id}`,
        kind: "info",
        badge: "Nova porudžbina",
        timeAgo: timeAgo(o.updatedAt, now),
        title: `Porudžbina #${shortId(o.id)} čeka potvrdu`,
        text: `Pacijent: ${patientName(o)} • ${counterpart(o)}`,
        footerNote: `Ordinacija: ${counterpart(o)}`,
        href: `/orders/${o.id}`,
      });
    }
  }
  const rank = { urgent: 0, rework: 1, info: 2 };
  alerts.sort((a, b) => rank[a.kind] - rank[b.kind]);

  const month = fmt(today, { month: "long" });
  const monthLabel = `${cap(month)} ${today.getFullYear()}`;

  return { monthLabel, weekNumber: isoWeek(today), weekLabel, weekDays, kpis, deadlineGroups, recentFilters, recentRows, alerts: alerts.slice(0, 6) };
}
