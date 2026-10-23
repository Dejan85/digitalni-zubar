import { api } from "./api";
import type {
  Company,
  CompanyType,
  Connection,
  ConnectionStatus,
  Note,
  Order,
  OrderDetail,
  OrderStatus,
  Patient,
  Service,
} from "./types";

// Endpoint funkcije primaju engleske nazive i same prave telo zahteva sa nazivima koje backend očekuje.

export interface RegisterInput {
  company: { name: string; type: CompanyType; address?: string; phone?: string; email?: string };
  user: { email: string; password: string };
}

export function login(email: string, password: string) {
  return api<{ token: string }>("/auth/login", {
    method: "POST",
    body: { email, lozinka: password },
    skipAuthRedirect: true,
  });
}

export function register({ company, user }: RegisterInput) {
  return api<{ token: string }>("/auth/register", {
    method: "POST",
    skipAuthRedirect: true,
    body: {
      firma: {
        naziv: company.name,
        tip: company.type,
        adresa: company.address,
        telefon: company.phone,
        email: company.email,
      },
      korisnik: { email: user.email, lozinka: user.password },
    },
  });
}

export function getMyCompany() {
  return api<{ company: Company }>("/firme/me");
}

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export function listOrders({ status, page, pageSize }: ListOrdersParams = {}) {
  return api<{ orders: Order[]; page: number; pageSize: number; total: number }>("/porudzbine", {
    query: { status, page, pageSize },
  });
}

export function getOrder(id: string) {
  return api<{ order: OrderDetail }>(`/porudzbine/${id}`);
}

export interface CreateOrderItemInput {
  serviceId?: string; // stavka iz kataloga (cenu uzima backend)
  freeDescription?: string; // slobodan opis — tada je cena obavezna
  quantity: number;
  price?: number;
}

export interface CreateOrderInput {
  technicianId: string;
  patientId: string;
  items: CreateOrderItemInput[];
}

export function createOrder(input: CreateOrderInput) {
  return api<{ order: { id: string } }>("/porudzbine", {
    method: "POST",
    body: {
      proteticarId: input.technicianId,
      pacijentId: input.patientId,
      stavke: input.items.map((i) => ({
        uslugaId: i.serviceId,
        slobodanOpis: i.freeDescription,
        kolicina: i.quantity,
        cena: i.price,
      })),
    },
  });
}

export function updateOrderStatus(id: string, status: OrderStatus, deliveryDeadline?: string) {
  return api<{ order: Order }>(`/porudzbine/${id}/status`, {
    method: "PATCH",
    body: { status, rokIsporuke: deliveryDeadline },
  });
}

export function updateMyCompany(input: { address?: string; phone?: string; email?: string }) {
  return api<{ company: Company }>("/firme/me", {
    method: "PATCH",
    body: { adresa: input.address, telefon: input.phone, email: input.email },
  });
}

export function searchCompanies(params: { type?: CompanyType; name?: string } = {}) {
  return api<{ companies: Company[] }>("/firme", { query: { tip: params.type, naziv: params.name } });
}

export function listConnections(params: { direction?: "poslate" | "primljene"; status?: ConnectionStatus } = {}) {
  return api<{ connections: Connection[] }>("/veze", { query: { smer: params.direction, status: params.status } });
}

export function sendConnectionRequest(companyId: string) {
  return api<{ connection: Connection }>("/veze", { method: "POST", body: { firmaId: companyId } });
}

export function respondToConnection(id: string, status: "prihvaceno" | "odbijeno") {
  return api<{ connection: Connection }>(`/veze/${id}`, { method: "PATCH", body: { status } });
}

export interface PatientInput {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  gender: "M" | "Z";
}

const patientBody = (p: Partial<PatientInput>) => ({
  ime: p.firstName,
  prezime: p.lastName,
  datumRodjenja: p.birthDate,
  pol: p.gender,
});

export function listPatients(q?: string) {
  return api<{ patients: Patient[] }>("/pacijenti", { query: { q } });
}

export function getPatient(id: string) {
  return api<{ patient: Patient }>(`/pacijenti/${id}`);
}

export function createPatient(input: PatientInput) {
  return api<{ patient: Patient }>("/pacijenti", { method: "POST", body: patientBody(input) });
}

export function updatePatient(id: string, input: PatientInput) {
  return api<{ patient: Patient }>(`/pacijenti/${id}`, { method: "PATCH", body: patientBody(input) });
}

export function deletePatient(id: string) {
  return api<void>(`/pacijenti/${id}`, { method: "DELETE" });
}

export interface ServiceInput {
  name: string;
  price: number;
}

const serviceBody = (s: ServiceInput) => ({ naziv: s.name, cena: s.price });

export function listServices(technicianId?: string) {
  return api<{ services: Service[] }>("/usluge", { query: { proteticarId: technicianId } });
}

// technicianId samo za super admina (u čiji katalog se upisuje usluga); ostali upisuju u svoj katalog
export function createService(input: ServiceInput, technicianId?: string) {
  return api<{ service: Service }>("/usluge", {
    method: "POST",
    body: { ...serviceBody(input), proteticarId: technicianId },
  });
}

export function updateService(id: string, input: ServiceInput) {
  return api<{ service: Service }>(`/usluge/${id}`, { method: "PATCH", body: serviceBody(input) });
}

export function deleteService(id: string) {
  return api<void>(`/usluge/${id}`, { method: "DELETE" });
}

export function listNotes(filter: { orderId?: string; patientId?: string }) {
  return api<{ notes: Note[] }>("/beleske", { query: { porudzbinaId: filter.orderId, pacijentId: filter.patientId } });
}

export function createNote(input: { orderId?: string; patientId?: string; text: string }) {
  return api<{ note: Note }>("/beleske", {
    method: "POST",
    body: { porudzbinaId: input.orderId, pacijentId: input.patientId, tekst: input.text },
  });
}
