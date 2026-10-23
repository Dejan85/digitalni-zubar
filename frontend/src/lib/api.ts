import { clearToken, readToken } from "./auth-storage";
import { fromWire } from "./wire";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Tipizovana greška: status HTTP-a, poruka backenda i (za 400) zod "details" po poljima
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] },
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// AuthProvider se pretplati da bi 401 odjavio korisnika
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  // telo ide na backend kakvo jeste (wire nazivi) — mapiranje zahteva radi sloj endpoint funkcija
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | undefined | null>;
  // login/register vraćaju 401/409 kao poslovnu grešku, ne kao isteklu sesiju
  skipAuthRedirect?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, query, skipAuthRedirect } = options;

  const url = new URL(API_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {};
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Server nije dostupan. Proveri konekciju i pokušaj ponovo.");
  }

  if (response.status === 204) return undefined as T;

  const json = (await response.json().catch(() => null)) as { error?: string; details?: ApiError["details"] } | null;

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect) {
      clearToken();
      onUnauthorized?.();
    }
    throw new ApiError(response.status, json?.error ?? "Došlo je do greške", json?.details);
  }

  // backend nazivi → engleski camelCase
  return fromWire<T>(json);
}
