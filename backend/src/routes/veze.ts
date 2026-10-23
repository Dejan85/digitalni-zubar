import { Request, Response, Router } from "express";

import { createVezaSchema, patchVezaStatusSchema } from "../auth/validation";
import { TipFirme } from "../auth/jwt";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/requireAuth";

export const vezeRouter = Router();

// sve rute u ovom fajlu su zasticene — veze postoje samo izmedju prijavljenih firmi
vezeRouter.use(requireAuth);

type StatusVeze = "na_cekanju" | "prihvaceno" | "odbijeno";

interface VezaRed {
  id: string;
  doktor_id: string;
  proteticar_id: string;
  posiljalac_id: string;
  status: StatusVeze;
  created_at: string;
  updated_at: string;
}

// pg error code za povredu UNIQUE/CHECK constraint-a
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "23505"
  );
}

vezeRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createVezaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { firmaId: ciljnaFirmaId } = parsed.data;
  const posiljalacId = req.auth!.firmaId;
  const posiljalacTip = req.auth!.tip;

  if (ciljnaFirmaId === posiljalacId) {
    res.status(400).json({ error: "Ne mozete poslati zahtev za konekciju sami sebi" });
    return;
  }

  const ciljnaFirmaRezultat = await pool.query<{ id: string; tip: TipFirme }>(
    "SELECT id, tip FROM firme WHERE id = $1",
    [ciljnaFirmaId],
  );
  const ciljnaFirma = ciljnaFirmaRezultat.rows[0];
  if (!ciljnaFirma) {
    res.status(404).json({ error: "Firma nije pronadjena" });
    return;
  }

  // konekcija ima smisla samo izmedju doktora i protetičara, nikad izmedju dva ista tipa
  if (ciljnaFirma.tip === posiljalacTip) {
    res.status(400).json({ error: "Konekcija je moguca samo izmedju doktora i protetičara" });
    return;
  }

  const doktorId = posiljalacTip === "doktor" ? posiljalacId : ciljnaFirmaId;
  const proteticarId = posiljalacTip === "proteticar" ? posiljalacId : ciljnaFirmaId;

  try {
    const rezultat = await pool.query<VezaRed>(
      `INSERT INTO veze_doktor_proteticar (doktor_id, proteticar_id, posiljalac_id)
       VALUES ($1, $2, $3)
       RETURNING id, doktor_id, proteticar_id, posiljalac_id, status, created_at, updated_at`,
      [doktorId, proteticarId, posiljalacId],
    );

    res.status(201).json({ veza: rezultat.rows[0] });
  } catch (error) {
    // UNIQUE(doktor_id, proteticar_id) — vec postoji zahtev ili veza sa ovim parom firmi
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Zahtev ili veza sa ovom firmom vec postoji" });
      return;
    }
    throw error;
  }
});

vezeRouter.patch("/:id", async (req: Request, res: Response) => {
  const parsed = patchVezaStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { status: noviStatus } = parsed.data;
  const mojaFirmaId = req.auth!.firmaId;

  const postojecaRezultat = await pool.query<VezaRed>(
    "SELECT id, doktor_id, proteticar_id, posiljalac_id, status, created_at, updated_at FROM veze_doktor_proteticar WHERE id = $1",
    [req.params.id],
  );
  const postojeca = postojecaRezultat.rows[0];

  const vidiSve = req.auth!.superAdmin;

  if (!postojeca || (!vidiSve && postojeca.doktor_id !== mojaFirmaId && postojeca.proteticar_id !== mojaFirmaId)) {
    // ista poruka za "ne postoji" i "nije moja veza" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Veza nije pronadjena" });
    return;
  }

  // samo primalac (strana koja NIJE poslala zahtev) sme da prihvati/odbije
  if (!vidiSve && postojeca.posiljalac_id === mojaFirmaId) {
    res.status(403).json({ error: "Ne mozete odgovoriti na sopstveni zahtev za konekciju" });
    return;
  }

  if (!vidiSve && postojeca.status !== "na_cekanju") {
    res.status(409).json({ error: "Na ovaj zahtev je vec odgovoreno" });
    return;
  }

  const rezultat = await pool.query<VezaRed>(
    `UPDATE veze_doktor_proteticar
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, doktor_id, proteticar_id, posiljalac_id, status, created_at, updated_at`,
    [noviStatus, postojeca.id],
  );

  res.status(200).json({ veza: rezultat.rows[0] });
});

vezeRouter.get("/", async (req: Request, res: Response) => {
  const { smer, status } = req.query;
  const mojaFirmaId = req.auth!.firmaId;

  if (smer !== undefined && smer !== "poslate" && smer !== "primljene") {
    res.status(400).json({ error: "smer mora biti 'poslate' ili 'primljene'" });
    return;
  }
  if (status !== undefined && status !== "na_cekanju" && status !== "prihvaceno" && status !== "odbijeno") {
    res.status(400).json({ error: "status mora biti 'na_cekanju', 'prihvaceno' ili 'odbijeno'" });
    return;
  }

  // smer se racuna u odnosu na posiljalac_id, ne na doktor_id/proteticar_id
  // (doktor i protetičar mogu podjednako da posalju zahtev)
  const rezultat = await pool.query<VezaRed>(
    `SELECT id, doktor_id, proteticar_id, posiljalac_id, status, created_at, updated_at
     FROM veze_doktor_proteticar
     WHERE ($4::boolean OR doktor_id = $1 OR proteticar_id = $1)
       AND ($2::text IS NULL OR status = $2)
       AND (
         $3::text IS NULL
         OR ($3 = 'poslate' AND posiljalac_id = $1)
         OR ($3 = 'primljene' AND posiljalac_id != $1)
       )
     ORDER BY created_at DESC`,
    [mojaFirmaId, status ?? null, smer ?? null, req.auth!.superAdmin], // super admin vidi veze svih firmi
  );

  res.status(200).json({ veze: rezultat.rows });
});
