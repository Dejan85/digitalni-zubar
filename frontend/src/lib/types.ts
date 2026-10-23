// Tipovi odgovora backenda posle mapiranja u lib/wire.ts (vidi documentation/API.md).
// Vrednosti enum-a (npr. "doktor", "primljena") su deo ugovora sa backendom i ostaju kakve jesu.

export type CompanyType = "doktor" | "proteticar";
export type ConnectionStatus = "na_cekanju" | "prihvaceno" | "odbijeno";
export type OrderStatus =
  | "primljena"
  | "potvrdjena"
  | "u_izradi"
  | "poslata"
  | "isporucena"
  | "otkazana"
  | "odbijena"
  | "vracena_na_doradu";

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Connection {
  id: string;
  doctorId: string;
  technicianId: string;
  senderId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "M" | "Z";
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  technicianId: string;
  name: string;
  price: string; // numeric iz Postgresa stiže kao string
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string | null;
  freeDescription: string | null;
  quantity: number;
  priceAtOrder: string;
  createdAt: string;
}

export interface Impression {
  id: string;
  orderId: string;
  type: "digitalni" | "analogni";
  filePath: string | null;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  doctorId: string;
  technicianId: string;
  patientId: string;
  status: OrderStatus;
  deliveryDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  patientFirstName?: string;
  patientLastName?: string;
  doctorName?: string;
  technicianName?: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  impressions: Impression[];
}

export interface Note {
  id: string;
  orderId: string | null;
  patientId: string | null;
  type: "rucna" | "automatska";
  date: string;
  text: string;
  createdAt: string;
}
