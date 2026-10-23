import { api } from "./api";
import type { Company, CompanyType, Order, OrderStatus } from "./types";

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
