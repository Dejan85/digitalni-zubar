import { deadlineInfo, initials } from "./orders-list";
import {
  hash,
  mockOrderExtras,
  mockPatientDetailAddress,
  mockPatientExtras,
  MOCK_PATIENT_HISTORY_PRICES,
} from "./orders-mock";
import { ORDER_STATUS_LABELS } from "./order-status";
import { ageOf, formatLongDate, ordersCountText } from "./patients-list";
import { shortId } from "./format";
import type { Order, OrderStatus, Patient } from "./types";

// Izvođenje ekrana "Detalji pacijenta" iz pacijenta i njegovih porudžbina — čista logika bez React-a.
// Šta nije stvarno (adresa, RFZO, cene, zubi...) dolazi iz orders-mock.ts.

const CLOSED: OrderStatus[] = ["isporucena", "otkazana", "odbijena"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
const STEPS = 5;
// faza izrade u laboratoriji po statusu (1–5): popunjeni segmenti su završene faze, tekuća faza pulsira
const PHASE: Partial<Record<OrderStatus, number>> = {
  primljena: 1,
  potvrdjena: 2,
  u_izradi: 3,
  vracena_na_doradu: 3,
  poslata: 4,
};

export interface PatientActiveOrder {
  id: string;
  label: string; // "#6e1a64a1"
  statusText: string;
  partnerName: string;
  title: string; // MOCK (usluga nije u listi porudžbina)
  deadlineText: string;
  startedText: string;
  phase: number;
  percent: number;
  stepsDone: number; // broj segmenata koji su gotovi (bez tekućeg)
}

export interface PatientHistoryRow {
  id: string;
  label: string;
  title: string; // MOCK
  teeth: string | null; // MOCK
  extra: string; // MOCK
  completedText: string;
  price: string; // MOCK
}

export interface PatientDetailData {
  fullName: string;
  initials: string;
  recordNumber: string;
  genderIcon: "male" | "female";
  demographics: string;
  jmbg: string;
  rfzo: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  lastUpdated: string;
  ordersText: string;
  inProgressCount: number;
  completedText: string;
  reworkCount: number;
  labName: string;
  lastInterventionDate: string;
  activeOrder: PatientActiveOrder | null;
  history: PatientHistoryRow[];
  historyCountText: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function archivedCountText(n: number): string {
  if (n === 1) return "1 arhiviran rad";
  return n >= 2 && n <= 4 ? `${n} arhivirana rada` : `${n} arhiviranih radova`;
}

function lastUpdatedText(iso: string, now: Date): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === now.toDateString();
  return `${sameDay ? "Danas" : `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`}, ${timeOf(d)}`;
}

function activeOrderOf(order: Order, now: Date): PatientActiveOrder {
  const phase = PHASE[order.status] ?? 1;
  const info = deadlineInfo(order, now);
  const d = order.deliveryDeadline ? new Date(order.deliveryDeadline) : null;
  const hint = info.deadlineHint ? ` (${info.deadlineHint[0].toLowerCase()}${info.deadlineHint.slice(1)})` : "";
  const created = new Date(order.createdAt);
  return {
    id: order.id,
    label: `#${shortId(order.id)}`,
    statusText: order.status === "u_izradi" ? "U izradi: CNC Glodanje" : ORDER_STATUS_LABELS[order.status],
    partnerName: order.technicianName ?? "—",
    title: mockOrderExtras(order, order.technicianName ?? "").service.title,
    deadlineText: d ? `${d.getDate()}. ${SHORT_MONTHS[d.getMonth()]}${hint}` : "—",
    startedText: `Započeto: ${formatLongDate(created)} u ${timeOf(created)}`,
    phase,
    percent: Math.round((phase / STEPS) * 100),
    stepsDone: phase - 1,
  };
}

export function buildPatientDetail(patient: Patient, orders: Order[], now: Date = new Date()): PatientDetailData {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const age = ageOf(patient.birthDate, now);
  const born = new Date(patient.birthDate);
  const extras = mockPatientExtras(patient);
  const { address, rfzo } = mockPatientDetailAddress(patient.id);
  const newestFirst = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const open = newestFirst.find((o) => !CLOSED.includes(o.status));

  const history = orders
    .filter((o) => o.status === "isporucena")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((o): PatientHistoryRow => {
      const { service } = mockOrderExtras(o, o.technicianName ?? "");
      return {
        id: o.id,
        label: `Nalog #${shortId(o.id)}`,
        title: service.title,
        teeth: service.tag ? service.tag.replace(/^FDI:\s*/, "") : null,
        extra: service.detail,
        completedText: formatLongDate(new Date(o.updatedAt)),
        price: MOCK_PATIENT_HISTORY_PRICES[hash(o.id) % MOCK_PATIENT_HISTORY_PRICES.length].toLocaleString("sr-Latn-RS"),
      };
    });

  const labCounts = new Map<string, number>();
  for (const o of orders) if (o.technicianName) labCounts.set(o.technicianName, (labCounts.get(o.technicianName) ?? 0) + 1);
  const labName = [...labCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const completed = orders.filter((o) => o.status === "isporucena").length;

  return {
    fullName,
    initials: initials(fullName) || "—",
    recordNumber: extras.recordNumber,
    genderIcon: patient.gender === "M" ? "male" : "female",
    demographics: `${patient.gender === "M" ? "Muški" : "Ženski"}, ${age} god. (${pad(born.getDate())}.${pad(born.getMonth() + 1)}.${born.getFullYear()}.)`,
    jmbg: extras.jmbg,
    rfzo,
    phone: extras.phone,
    phoneHref: extras.phoneHref,
    email: extras.email,
    address,
    lastUpdated: lastUpdatedText(patient.updatedAt, now),
    ordersText: ordersCountText(orders.length),
    inProgressCount: orders.filter((o) => o.status === "u_izradi").length,
    completedText: `${completed} završen${completed === 1 ? "" : "a"}`,
    reworkCount: orders.filter((o) => o.status === "vracena_na_doradu").length,
    labName,
    lastInterventionDate: newestFirst[0] ? formatLongDate(new Date(newestFirst[0].createdAt)) : "—",
    activeOrder: open ? activeOrderOf(open, now) : null,
    history,
    historyCountText: archivedCountText(history.length),
  };
}
