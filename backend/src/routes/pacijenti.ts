import { Request, Response, Router } from "express";

import { createPacijentSchema, patchPacijentSchema } from "../auth/validation";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/requireAuth";
import { requireTip } from "../middleware/requireTip";

export const pacijentiRouter = Router();

// pacijenti pripadaju iskljucivo doktoru — protetičar obradjuje porudzbine za njih, ali ih ne vodi u svojoj evidenciji
pacijentiRouter.use(requireAuth, requireTip("doktor"));

interface PacijentRed {
  id: string;
  doktor_id: string;
  ime: string;
  prezime: string;
  datum_rodjenja: string;
  pol: "M" | "Z";
  created_at: string;
  updated_at: string;
}

pacijentiRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createPacijentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { ime, prezime, datumRodjenja, pol } = parsed.data;

  const rezultat = await pool.query<PacijentRed>(
    `INSERT INTO pacijenti (doktor_id, ime, prezime, datum_rodjenja, pol)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, doktor_id, ime, prezime, datum_rodjenja, pol, created_at, updated_at`,
    [req.auth!.firmaId, ime, prezime, datumRodjenja, pol],
  );

  res.status(201).json({ pacijent: rezultat.rows[0] });
});

pacijentiRouter.get("/", async (req: Request, res: Response) => {
  const { q } = req.query;

  if (q !== undefined && typeof q !== "string") {
    res.status(400).json({ error: "q mora biti string" });
    return;
  }

  // scoped na doktor_id ulogovanog korisnika — doktor ne vidi pacijente drugih doktora
  // ILIKE '%q%' na ime i prezime — case-insensitive pretraga po delu imena ili prezimena
  const rezultat = await pool.query<PacijentRed>(
    `SELECT id, doktor_id, ime, prezime, datum_rodjenja, pol, created_at, updated_at
     FROM pacijenti
     WHERE doktor_id = $1
       AND ($2::text IS NULL OR ime ILIKE '%' || $2 || '%' OR prezime ILIKE '%' || $2 || '%')
     ORDER BY prezime, ime`,
    [req.auth!.firmaId, q ?? null],
  );

  res.status(200).json({ pacijenti: rezultat.rows });
});

pacijentiRouter.get("/:id", async (req: Request, res: Response) => {
  const rezultat = await pool.query<PacijentRed>(
    `SELECT id, doktor_id, ime, prezime, datum_rodjenja, pol, created_at, updated_at
     FROM pacijenti
     WHERE id = $1 AND doktor_id = $2`,
    [req.params.id, req.auth!.firmaId],
  );

  const pacijent = rezultat.rows[0];
  if (!pacijent) {
    // ista poruka za "ne postoji" i "tudj pacijent" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Pacijent nije pronadjen" });
    return;
  }

  res.status(200).json({ pacijent });
});

pacijentiRouter.patch("/:id", async (req: Request, res: Response) => {
  const parsed = patchPacijentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "Nema polja za izmenu" });
    return;
  }

  const { ime, prezime, datumRodjenja, pol } = parsed.data;

  // COALESCE cuva postojecu vrednost kolone kad odgovarajuce polje nije poslato u body-ju
  const rezultat = await pool.query<PacijentRed>(
    `UPDATE pacijenti
     SET ime = COALESCE($1, ime),
         prezime = COALESCE($2, prezime),
         datum_rodjenja = COALESCE($3, datum_rodjenja),
         pol = COALESCE($4, pol),
         updated_at = now()
     WHERE id = $5 AND doktor_id = $6
     RETURNING id, doktor_id, ime, prezime, datum_rodjenja, pol, created_at, updated_at`,
    [ime ?? null, prezime ?? null, datumRodjenja ?? null, pol ?? null, req.params.id, req.auth!.firmaId],
  );

  const pacijent = rezultat.rows[0];
  if (!pacijent) {
    res.status(404).json({ error: "Pacijent nije pronadjen" });
    return;
  }

  res.status(200).json({ pacijent });
});

pacijentiRouter.delete("/:id", async (req: Request, res: Response) => {
  const rezultat = await pool.query("DELETE FROM pacijenti WHERE id = $1 AND doktor_id = $2 RETURNING id", [
    req.params.id,
    req.auth!.firmaId,
  ]);

  if (rezultat.rowCount === 0) {
    res.status(404).json({ error: "Pacijent nije pronadjen" });
    return;
  }

  res.status(204).send();
});
