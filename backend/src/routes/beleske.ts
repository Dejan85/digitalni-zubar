import { Request, Response, Router } from "express";

import { createBeleskaSchema } from "../auth/validation";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/requireAuth";

export const beleskeRouter = Router();

// beleska moze biti vezana za porudzbinu (vidljiva i doktoru i protetičaru te porudzbine)
// i/ili za pacijenta (pacijenti su strogo vlasnistvo doktora, isto kao u pacijenti.ts)
beleskeRouter.use(requireAuth);

interface BeleskaRed {
  id: string;
  porudzbina_id: string | null;
  pacijent_id: string | null;
  tip: "rucna" | "automatska";
  datum: string;
  tekst: string;
  created_at: string;
}

// koliko dana pre roka isporuke se generise automatska beleska — odluka pri implementaciji (Faza 10)
const PRAG_DANA_DO_ROKA = 2;

// "provera pri citanju" umesto cron job-a: najjednostavnije za MVP, bez dodatne infrastrukture (worker/scheduler).
// Nedostatak: alarm se pojavi tek kad neko sledeci put ucita listu, ne odmah kad rok postane blizak — prihvatljivo za sada.
// NOT EXISTS sprecava duplikate: po porudzbini se generise najvise jedna automatska beleska, ne jedna po svakom citanju.
async function generisiAutomatskeAlarme(firmaId: string): Promise<void> {
  await pool.query(
    `INSERT INTO beleske (porudzbina_id, tip, tekst)
     SELECT p.id, 'automatska', 'Rok isporuke (' || to_char(p.rok_isporuke, 'DD.MM.YYYY') || ') se priblizava'
     FROM porudzbine p
     WHERE (p.doktor_id = $1 OR p.proteticar_id = $1)
       AND p.rok_isporuke IS NOT NULL
       AND p.rok_isporuke <= (now() + $2 * interval '1 day')
       AND p.status NOT IN ('isporucena', 'otkazana', 'odbijena')
       AND NOT EXISTS (
         SELECT 1 FROM beleske b WHERE b.porudzbina_id = p.id AND b.tip = 'automatska'
       )`,
    [firmaId, PRAG_DANA_DO_ROKA],
  );
}

beleskeRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createBeleskaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { porudzbinaId, pacijentId, tekst } = parsed.data;
  const mojaFirmaId = req.auth!.firmaId;

  if (porudzbinaId) {
    const porudzbinaRezultat = await pool.query<{ pacijent_id: string }>(
      `SELECT pacijent_id FROM porudzbine WHERE id = $1 AND (doktor_id = $2 OR proteticar_id = $2)`,
      [porudzbinaId, mojaFirmaId],
    );
    const porudzbina = porudzbinaRezultat.rows[0];
    if (!porudzbina) {
      // ista poruka za "ne postoji" i "tudja porudzbina" — ne otkrivamo tudje id-jeve
      res.status(404).json({ error: "Porudzbina nije pronadjena" });
      return;
    }
    // ako je poslat i pacijentId, mora odgovarati pacijentu te iste porudzbine — sprecava mesanje nepovezanih zapisa
    if (pacijentId && pacijentId !== porudzbina.pacijent_id) {
      res.status(400).json({ error: "pacijentId ne odgovara pacijentu iz navedene porudzbine" });
      return;
    }
  } else if (pacijentId) {
    // bez porudzbinaId, beleska vezana samo za pacijenta sme da je unese jedino doktor koji ga vodi
    const pacijentRezultat = await pool.query("SELECT 1 FROM pacijenti WHERE id = $1 AND doktor_id = $2", [
      pacijentId,
      mojaFirmaId,
    ]);
    if (pacijentRezultat.rowCount === 0) {
      res.status(404).json({ error: "Pacijent nije pronadjen" });
      return;
    }
  }

  const rezultat = await pool.query<BeleskaRed>(
    `INSERT INTO beleske (porudzbina_id, pacijent_id, tip, tekst)
     VALUES ($1, $2, 'rucna', $3)
     RETURNING id, porudzbina_id, pacijent_id, tip, datum, tekst, created_at`,
    [porudzbinaId ?? null, pacijentId ?? null, tekst],
  );

  res.status(201).json({ beleska: rezultat.rows[0] });
});

beleskeRouter.get("/", async (req: Request, res: Response) => {
  const { porudzbinaId, pacijentId } = req.query;
  const mojaFirmaId = req.auth!.firmaId;

  if (porudzbinaId !== undefined && typeof porudzbinaId !== "string") {
    res.status(400).json({ error: "porudzbinaId mora biti string" });
    return;
  }
  if (pacijentId !== undefined && typeof pacijentId !== "string") {
    res.status(400).json({ error: "pacijentId mora biti string" });
    return;
  }
  if (!porudzbinaId && !pacijentId) {
    res.status(400).json({ error: "Potreban je bar jedan filter: porudzbinaId ili pacijentId" });
    return;
  }

  if (porudzbinaId) {
    const porudzbinaRezultat = await pool.query(
      `SELECT 1 FROM porudzbine WHERE id = $1 AND (doktor_id = $2 OR proteticar_id = $2)`,
      [porudzbinaId, mojaFirmaId],
    );
    if (porudzbinaRezultat.rowCount === 0) {
      res.status(404).json({ error: "Porudzbina nije pronadjena" });
      return;
    }
  }
  if (pacijentId) {
    const pacijentRezultat = await pool.query("SELECT 1 FROM pacijenti WHERE id = $1 AND doktor_id = $2", [
      pacijentId,
      mojaFirmaId,
    ]);
    if (pacijentRezultat.rowCount === 0) {
      res.status(404).json({ error: "Pacijent nije pronadjen" });
      return;
    }
  }

  // generisi alarme pre citanja liste, tako da tek nastali automatski zapisi budu odmah vidljivi u istom odgovoru
  await generisiAutomatskeAlarme(mojaFirmaId);

  const rezultat = await pool.query<BeleskaRed>(
    `SELECT id, porudzbina_id, pacijent_id, tip, datum, tekst, created_at
     FROM beleske
     WHERE ($1::uuid IS NULL OR porudzbina_id = $1)
       AND ($2::uuid IS NULL OR pacijent_id = $2)
     ORDER BY datum DESC`,
    [porudzbinaId ?? null, pacijentId ?? null],
  );

  res.status(200).json({ beleske: rezultat.rows });
});
