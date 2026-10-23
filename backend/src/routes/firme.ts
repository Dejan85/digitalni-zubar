import { Request, Response, Router } from "express";

import { patchFirmaSchema } from "../auth/validation";
import { TipFirme } from "../auth/jwt";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/requireAuth";

export const firmeRouter = Router();

// sve rute u ovom fajlu su zasticene — nema smisla pregledati/menjati firme bez prijave
firmeRouter.use(requireAuth);

interface FirmaRed {
  id: string;
  naziv: string;
  tip: TipFirme;
  adresa: string | null;
  telefon: string | null;
  email: string | null;
}

firmeRouter.get("/me", async (req: Request, res: Response) => {
  // req.auth je popunjen u requireAuth; firmaId identifikuje CIJU firmu vracamo
  const rezultat = await pool.query("SELECT id, naziv, tip, adresa, telefon, email FROM firme WHERE id = $1", [
    req.auth!.firmaId,
  ]);

  const firma = rezultat.rows[0] as FirmaRed | undefined;
  if (!firma) {
    res.status(404).json({ error: "Firma nije pronadjena" });
    return;
  }

  res.status(200).json({ firma });
});

firmeRouter.patch("/me", async (req: Request, res: Response) => {
  const parsed = patchFirmaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  // partial() moze da vrati prazan objekat (npr. PATCH sa {}) — nema sta da se azurira
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "Nema polja za izmenu" });
    return;
  }

  const { adresa, telefon, email } = parsed.data;

  // COALESCE cuva postojecu vrednost kolone kad odgovarajuce polje nije poslato u body-ju (undefined -> null parametar)
  const rezultat = await pool.query(
    `UPDATE firme
     SET adresa = COALESCE($1, adresa),
         telefon = COALESCE($2, telefon),
         email = COALESCE($3, email),
         updated_at = now()
     WHERE id = $4
     RETURNING id, naziv, tip, adresa, telefon, email`,
    [adresa ?? null, telefon ?? null, email ?? null, req.auth!.firmaId],
  );

  const firma = rezultat.rows[0] as FirmaRed | undefined;
  if (!firma) {
    res.status(404).json({ error: "Firma nije pronadjena" });
    return;
  }

  res.status(200).json({ firma });
});

firmeRouter.get("/", async (req: Request, res: Response) => {
  const { tip, naziv } = req.query;

  if (tip !== undefined && tip !== "doktor" && tip !== "proteticar") {
    res.status(400).json({ error: "tip mora biti 'doktor' ili 'proteticar'" });
    return;
  }
  if (naziv !== undefined && typeof naziv !== "string") {
    res.status(400).json({ error: "naziv mora biti string" });
    return;
  }

  // sopstvenu firmu ne prikazujemo u listingu — doktor trazi proteticare (i obrnuto), ne sebe
  // (super admin vidi sve firme, ukljucujuci svoju, da bi mogao da razresi imena u pregledima)
  // ILIKE '%naziv%' — case-insensitive pretraga po delu naziva firme
  const rezultat = await pool.query(
    `SELECT id, naziv, tip, adresa, telefon, email
     FROM firme
     WHERE ($1::text IS NULL OR tip = $1)
       AND ($2::text IS NULL OR naziv ILIKE '%' || $2 || '%')
       AND ($4::boolean OR id != $3)
     ORDER BY naziv`,
    [tip ?? null, naziv ?? null, req.auth!.firmaId, req.auth!.superAdmin],
  );

  res.status(200).json({ firme: rezultat.rows as FirmaRed[] });
});
