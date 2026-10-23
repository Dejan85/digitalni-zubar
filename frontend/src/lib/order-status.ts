import type { CompanyType, OrderStatus } from "./types";

// centralni rečnik prikaza statusa porudžbine; vrednosti enum-a su ugovor sa backendom
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  primljena: "Primljena",
  potvrdjena: "Potvrđena",
  u_izradi: "U izradi",
  poslata: "Poslata",
  isporucena: "Isporučena",
  otkazana: "Otkazana",
  odbijena: "Odbijena",
  vracena_na_doradu: "Vraćena na doradu",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export type StatusTone = "neutral" | "info" | "success" | "danger";

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  primljena: "neutral",
  potvrdjena: "info",
  u_izradi: "info",
  poslata: "info",
  isporucena: "success",
  otkazana: "danger",
  odbijena: "danger",
  vracena_na_doradu: "danger",
};

// ogledalo backend pravila (routes/porudzbine.ts): dozvoljene tranzicije i ko sme da postavi koji status
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  primljena: ["potvrdjena", "odbijena", "otkazana"],
  potvrdjena: ["u_izradi", "otkazana"],
  u_izradi: ["poslata", "otkazana"],
  poslata: ["isporucena", "vracena_na_doradu"],
  isporucena: ["vracena_na_doradu"],
  otkazana: [],
  odbijena: [],
  vracena_na_doradu: ["u_izradi"],
};

const STATUS_SETTER: Record<Exclude<OrderStatus, "primljena">, CompanyType> = {
  potvrdjena: "proteticar",
  u_izradi: "proteticar",
  poslata: "proteticar",
  isporucena: "doktor",
  otkazana: "doktor",
  odbijena: "proteticar",
  vracena_na_doradu: "doktor",
};

export function allowedTransitions(from: OrderStatus, companyType: CompanyType): OrderStatus[] {
  return ORDER_TRANSITIONS[from].filter((next) => STATUS_SETTER[next as Exclude<OrderStatus, "primljena">] === companyType);
}

// tekst dugmeta za prelaz u dati status
export const ORDER_STATUS_ACTIONS: Record<OrderStatus, string> = {
  primljena: "Primljena",
  potvrdjena: "Potvrdi porudžbinu",
  u_izradi: "Započni izradu",
  poslata: "Označi kao poslatu",
  isporucena: "Potvrdi prijem",
  otkazana: "Otkaži",
  odbijena: "Odbij",
  vracena_na_doradu: "Vrati na doradu",
};
