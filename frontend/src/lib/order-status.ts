import type { OrderStatus } from "./types";

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
