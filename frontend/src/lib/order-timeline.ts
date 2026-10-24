import type { OrderStatus } from "./types";

// Tok izrade (dizajn/porudzbina): 7 faza. Backend zna samo status porudžbine, pa se faze izvode iz njega —
// prave vremenske oznake postoje samo za kreiranje (`createdAt`) i za poslednju promenu (`updatedAt`),
// ostalo je opis faze iz dizajna (nema istorije statusa).

export type PhaseState = "done" | "current" | "pending";

export interface TimelinePhase {
  title: string;
  description: string;
  state: PhaseState;
  time?: string;
}

interface TimelineInput {
  status: OrderStatus;
  doctorName: string;
  technicianName: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
}

const STATIC_PHASES = [
  { title: "Potvrđen prijem u laboratoriji", description: "" },
  { title: "CAD modelovanje", description: "Preuzeti 3D fajlovi i odobren digitalni dizajn." },
  { title: "U izradi (Milling / CNC glodanje)", description: "Glodanje monolitnog višeslojnog cirkonijumskog diska." },
  { title: "Sinterovanje i individualizacija", description: "Peć na 1550°C, glaziranje i nanošenje VITA keramike" },
  { title: "Kontrola kvaliteta & Slanje", description: "Pakovanje u zaštitnu ambalažu i predaja kuriru" },
  { title: "Isporuka u ordinaciju", description: "Pripremljeno za cementiranje kod pacijenta" },
];

// indeks faze koja je "sada" (0-6); 7 = sve završeno; -1 = tok zaustavljen (otkazana/odbijena)
const CURRENT_PHASE: Record<OrderStatus, number> = {
  primljena: 1,
  potvrdjena: 2,
  u_izradi: 3,
  vracena_na_doradu: 3,
  poslata: 6,
  isporucena: 7,
  otkazana: -1,
  odbijena: -1,
};

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("sr-Latn-RS", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function buildTimeline(input: TimelineInput): { phases: TimelinePhase[]; progress: string } {
  const current = CURRENT_PHASE[input.status];
  const stateOf = (index: number): PhaseState => {
    if (index === 0) return "done";
    if (current === -1) return "pending";
    if (index < current) return "done";
    return index === current ? "current" : "pending";
  };

  const all = [
    {
      title: "Kreirana porudžbina",
      description: `${input.doctorName} uneo nalog i otisak.`,
    },
    ...STATIC_PHASES.map((phase, i) =>
      i === 0 ? { ...phase, description: `${input.technicianName} prihvatila rad.` } : phase,
    ),
  ];

  const phases = all.map((phase, index): TimelinePhase => {
    const state = stateOf(index);
    let time: string | undefined;
    if (index === 0) time = formatDateTime(input.createdAt);
    else if (state === "current") time = formatDateTime(input.updatedAt);
    else if (index === 5 && state === "pending" && input.deadline !== "—") time = `Predviđeno: ${input.deadline}`;
    return { ...phase, state, time };
  });

  const progress = current === -1 ? "Zaustavljeno" : `Faza ${Math.min(current + 1, 7)}/7`;
  return { phases, progress };
}
