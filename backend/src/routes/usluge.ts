import { Request, Response, Router } from "express";

import { createUslugaSchema, patchUslugaSchema } from "../auth/validation";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/requireAuth";
import { requireTip } from "../middleware/requireTip";

export const uslugeRouter = Router();

// GET je dostupan i doktoru i protetičaru (doktor gleda katalog povezanih protetičara),
// pa se requireTip("proteticar") primenjuje pojedinacno na rute za izmenu, ne na ceo router
uslugeRouter.use(requireAuth);

interface UslugaRed {
  id: string;
  proteticar_id: string;
  naziv: string;
  cena: string;
  created_at: string;
  updated_at: string;
}

uslugeRouter.post("/", requireTip("proteticar"), async (req: Request, res: Response) => {
  const parsed = createUslugaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { naziv, cena } = parsed.data;

  // super admin upisuje uslugu u katalog izabranog protetičara (obavezno polje proteticarId); inace moj katalog
  const body = req.body as { proteticarId?: unknown };
  if (req.auth!.superAdmin && typeof body.proteticarId !== "string") {
    res.status(400).json({ error: "proteticarId je obavezan za super admina" });
    return;
  }
  const proteticarId = req.auth!.superAdmin ? (body.proteticarId as string) : req.auth!.firmaId;

  const rezultat = await pool.query<UslugaRed>(
    `INSERT INTO usluge (proteticar_id, naziv, cena)
     VALUES ($1, $2, $3)
     RETURNING id, proteticar_id, naziv, cena, created_at, updated_at`,
    [proteticarId, naziv, cena],
  );

  res.status(201).json({ usluga: rezultat.rows[0] });
});

uslugeRouter.get("/", async (req: Request, res: Response) => {
  const mojaFirmaId = req.auth!.firmaId;

  if (req.auth!.superAdmin) {
    // super admin vidi kataloge svih protetičara, opciono suzeno na jednog
    const { proteticarId } = req.query;
    if (proteticarId !== undefined && typeof proteticarId !== "string") {
      res.status(400).json({ error: "proteticarId mora biti string" });
      return;
    }

    const rezultat = await pool.query<UslugaRed>(
      `SELECT id, proteticar_id, naziv, cena, created_at, updated_at
       FROM usluge
       WHERE ($1::uuid IS NULL OR proteticar_id = $1)
       ORDER BY naziv`,
      [proteticarId ?? null],
    );

    res.status(200).json({ usluge: rezultat.rows });
    return;
  }

  if (req.auth!.tip === "proteticar") {
    // protetičar vidi sopstveni katalog
    const rezultat = await pool.query<UslugaRed>(
      `SELECT id, proteticar_id, naziv, cena, created_at, updated_at
       FROM usluge
       WHERE proteticar_id = $1
       ORDER BY naziv`,
      [mojaFirmaId],
    );

    res.status(200).json({ usluge: rezultat.rows });
    return;
  }

  // doktor vidi katalog protetičara sa kojima ima prihvacenu vezu — opciono suzen na jednog protetičara
  const { proteticarId } = req.query;
  if (proteticarId !== undefined && typeof proteticarId !== "string") {
    res.status(400).json({ error: "proteticarId mora biti string" });
    return;
  }

  const rezultat = await pool.query<UslugaRed>(
    `SELECT u.id, u.proteticar_id, u.naziv, u.cena, u.created_at, u.updated_at
     FROM usluge u
     JOIN veze_doktor_proteticar v ON v.proteticar_id = u.proteticar_id
     WHERE v.doktor_id = $1
       AND v.status = 'prihvaceno'
       AND ($2::uuid IS NULL OR u.proteticar_id = $2)
     ORDER BY u.naziv`,
    [mojaFirmaId, proteticarId ?? null],
  );

  res.status(200).json({ usluge: rezultat.rows });
});

uslugeRouter.patch("/:id", requireTip("proteticar"), async (req: Request, res: Response) => {
  const parsed = patchUslugaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "Nema polja za izmenu" });
    return;
  }

  const { naziv, cena } = parsed.data;

  // COALESCE cuva postojecu vrednost kolone kad odgovarajuce polje nije poslato u body-ju
  const rezultat = await pool.query<UslugaRed>(
    `UPDATE usluge
     SET naziv = COALESCE($1, naziv),
         cena = COALESCE($2, cena),
         updated_at = now()
     WHERE id = $3 AND ($5::boolean OR proteticar_id = $4)
     RETURNING id, proteticar_id, naziv, cena, created_at, updated_at`,
    [naziv ?? null, cena ?? null, req.params.id, req.auth!.firmaId, req.auth!.superAdmin],
  );

  const usluga = rezultat.rows[0];
  if (!usluga) {
    // ista poruka za "ne postoji" i "tudja usluga" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Usluga nije pronadjena" });
    return;
  }

  res.status(200).json({ usluga });
});

uslugeRouter.delete("/:id", requireTip("proteticar"), async (req: Request, res: Response) => {
  const rezultat = await pool.query(
    "DELETE FROM usluge WHERE id = $1 AND ($3::boolean OR proteticar_id = $2) RETURNING id",
    [req.params.id, req.auth!.firmaId, req.auth!.superAdmin],
  );

  if (rezultat.rowCount === 0) {
    res.status(404).json({ error: "Usluga nije pronadjena" });
    return;
  }

  res.status(204).send();
});
