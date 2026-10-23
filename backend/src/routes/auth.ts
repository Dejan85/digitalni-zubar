import { Request, Response, Router } from "express";

import { signAuthToken } from "../auth/jwt";
import { hashPassword, verifyPassword } from "../auth/password";
import { loginSchema, registerSchema } from "../auth/validation";
import { pool } from "../db/pool";
import { withTransaction } from "../db/transaction";
import { authRateLimit } from "../middleware/authRateLimit";

export const authRouter = Router();

// zajednicko za register i login — obe rute su meta za brute-force/spam napade
authRouter.use(authRateLimit);

// pg error code za povredu UNIQUE constraint-a (ovde: korisnici_email_unique)
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "23505"
  );
}

authRouter.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }
  const { firma, korisnik } = parsed.data;

  // provera unapred daje lepsu poruku u obicnom slucaju; UNIQUE constraint ispod je prava
  // odbrana ako dva zahteva stignu istovremeno (race condition)
  const postojeciKorisnik = await pool.query("SELECT id FROM korisnici WHERE email = $1", [korisnik.email]);
  if ((postojeciKorisnik.rowCount ?? 0) > 0) {
    res.status(409).json({ error: "Korisnik sa ovim email-om vec postoji" });
    return;
  }

  const passwordHash = await hashPassword(korisnik.lozinka);

  try {
    const { noviFirma, noviKorisnik } = await withTransaction(async (client) => {
      const firmaRezultat = await client.query(
        `INSERT INTO firme (naziv, tip, adresa, telefon, email)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, naziv, tip`,
        [firma.naziv, firma.tip, firma.adresa ?? null, firma.telefon ?? null, firma.email ?? null],
      );
      const noviFirma = firmaRezultat.rows[0] as { id: string; naziv: string; tip: "doktor" | "proteticar" };

      const korisnikRezultat = await client.query(
        `INSERT INTO korisnici (firma_id, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email`,
        [noviFirma.id, korisnik.email, passwordHash],
      );
      const noviKorisnik = korisnikRezultat.rows[0] as { id: string; email: string };

      return { noviFirma, noviKorisnik };
    });

    const token = signAuthToken({
      korisnikId: noviKorisnik.id,
      firmaId: noviFirma.id,
      tip: noviFirma.tip,
    });

    res.status(201).json({
      token,
      firma: noviFirma,
      korisnik: noviKorisnik,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Korisnik sa ovim email-om vec postoji" });
      return;
    }
    throw error;
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }
  const { email, lozinka } = parsed.data;

  const rezultat = await pool.query(
    `SELECT k.id, k.password_hash, f.id AS firma_id, f.tip
     FROM korisnici k
     JOIN firme f ON f.id = k.firma_id
     WHERE k.email = $1`,
    [email],
  );

  const red = rezultat.rows[0] as
    { id: string; password_hash: string; firma_id: string; tip: "doktor" | "proteticar" } | undefined;

  // ista poruka za "nema tog email-a" i "pogresna lozinka" — ne otkrivamo napadacu koji email postoji
  if (!red) {
    res.status(401).json({ error: "Pogresan email ili lozinka" });
    return;
  }

  const lozinkaValidna = await verifyPassword(lozinka, red.password_hash);
  if (!lozinkaValidna) {
    res.status(401).json({ error: "Pogresan email ili lozinka" });
    return;
  }

  const token = signAuthToken({
    korisnikId: red.id,
    firmaId: red.firma_id,
    tip: red.tip,
  });

  res.status(200).json({ token });
});
