import jwt, { SignOptions } from "jsonwebtoken";

export type TipFirme = "doktor" | "proteticar";

// Payload koji ide u JWT — dovoljno da svaka zasticena ruta zna KO pita i U IME KOJE firme,
// bez dodatnog upita u bazu na svaki request.
export interface AuthTokenPayload {
  korisnikId: string;
  firmaId: string;
  tip: TipFirme;
}

// fail-fast na startu servera je bolji od tihog potpisivanja tokena praznim kljucem;
// IIFE ovde (umesto obicnog if-a) postoji zato sto TS ne prenosi "undefined je iskljucen"
// proveru iz ove linije u tela funkcija ispod, koje se pozivaju tek kasnije
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET nije podesen u .env fajlu");
  }
  return secret;
})();

// jsonwebtoken tipizira expiresIn kao "1h"/"30m"/broj sekundi, ne kao proizvoljan string,
// pa env vrednost (obican string) mora eksplicitno da se prevede u taj tip.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  // jwt.verify baca gresku za istekao/nevazeci/falsifikovan token — poziva ga middleware sa try/catch
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
