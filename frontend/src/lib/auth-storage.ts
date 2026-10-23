import type { CompanyType } from "./types";

const STORAGE_KEY = "dz_token";

export interface Session {
  userId: string;
  companyId: string;
  type: CompanyType;
}

// localStorage može da baci grešku (privatni prozor, blokirani podaci) — tada se ponašamo kao da tokena nema
export function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* bez perzistencije sesija važi samo do reload-a */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignoriši */
  }
}

// JWT payload je samo base64url JSON — čitamo ga radi prikaza (tip firme), potpis proverava backend
export function decodeToken(token: string): Session | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as { korisnikId: string; firmaId: string; tip: CompanyType; exp?: number };
    if (data.exp && data.exp * 1000 < Date.now()) return null;
    return { userId: data.korisnikId, companyId: data.firmaId, type: data.tip };
  } catch {
    return null;
  }
}
