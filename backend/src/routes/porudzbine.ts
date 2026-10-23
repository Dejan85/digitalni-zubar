import fs from "node:fs";

import { NextFunction, Request, Response, Router } from "express";

import { createOtisakSchema, createPorudzbinaSchema, patchPorudzbinaStatusSchema } from "../auth/validation";
import { TipFirme } from "../auth/jwt";
import { pool } from "../db/pool";
import { withTransaction } from "../db/transaction";
import { requireAuth } from "../middleware/requireAuth";
import { requireTip } from "../middleware/requireTip";
import { otisakFajlPath, upload } from "../middleware/upload";

export const porudzbineRouter = Router();

// sve rute u ovom fajlu su zasticene — porudzbina postoji samo izmedju prijavljenih firmi
porudzbineRouter.use(requireAuth);

type StatusPorudzbine =
  "primljena" | "potvrdjena" | "u_izradi" | "poslata" | "isporucena" | "otkazana" | "odbijena" | "vracena_na_doradu";

const SVI_STATUSI: StatusPorudzbine[] = [
  "primljena",
  "potvrdjena",
  "u_izradi",
  "poslata",
  "isporucena",
  "otkazana",
  "odbijena",
  "vracena_na_doradu",
];

interface PorudzbinaRed {
  id: string;
  doktor_id: string;
  proteticar_id: string;
  pacijent_id: string;
  status: StatusPorudzbine;
  rok_isporuke: string | null;
  datum_kreiranja: string;
  updated_at: string;
}

interface StavkaRed {
  id: string;
  porudzbina_id: string;
  usluga_id: string | null;
  slobodan_opis: string | null;
  kolicina: number;
  cena_u_trenutku: string;
  created_at: string;
}

interface OtisakRed {
  id: string;
  porudzbina_id: string;
  tip: "digitalni" | "analogni";
  fajl_path: string | null;
  napomena: string | null;
  created_at: string;
}

// baza (CHECK constraint) ogranicava samo SKUP dozvoljenih vrednosti statusa — dozvoljeni
// REDOSLED prelaza izmedju njih je iskljucivo pravilo aplikacije, provereno ovde pri PATCH-u
const DOZVOLJENE_TRANZICIJE: Record<StatusPorudzbine, StatusPorudzbine[]> = {
  primljena: ["potvrdjena", "odbijena", "otkazana"],
  potvrdjena: ["u_izradi", "otkazana"],
  u_izradi: ["poslata", "otkazana"],
  poslata: ["isporucena", "vracena_na_doradu"],
  isporucena: ["vracena_na_doradu"],
  otkazana: [],
  odbijena: [],
  vracena_na_doradu: ["u_izradi"],
};

// ko sme da postavi koji status — doktor narucuje/prima/otkazuje, protetičar potvrdjuje/izraduje/isporucuje
const TIP_KOJI_POSTAVLJA_STATUS: Record<Exclude<StatusPorudzbine, "primljena">, TipFirme> = {
  potvrdjena: "proteticar",
  u_izradi: "proteticar",
  poslata: "proteticar",
  isporucena: "doktor",
  otkazana: "doktor",
  odbijena: "proteticar",
  vracena_na_doradu: "doktor",
};

// pg error code za povredu FK constraint-a (npr. usluga_id koji je izbrisan izmedju provere i insert-a)
function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "23503"
  );
}

porudzbineRouter.post("/", requireTip("doktor"), async (req: Request, res: Response) => {
  const parsed = createPorudzbinaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { proteticarId, pacijentId, stavke } = parsed.data;
  const doktorId = req.auth!.firmaId;

  // porudzbina je moguca samo ako doktor i protetičar imaju prihvacenu vezu (isti uslov kao katalog usluga)
  const vezaRezultat = await pool.query(
    `SELECT 1 FROM veze_doktor_proteticar WHERE doktor_id = $1 AND proteticar_id = $2 AND status = 'prihvaceno'`,
    [doktorId, proteticarId],
  );
  if (vezaRezultat.rowCount === 0) {
    res.status(400).json({ error: "Porudzbina je moguca samo sa protetičarom sa kojim imate prihvacenu vezu" });
    return;
  }

  // pacijent mora pripadati ovom doktoru — ista provera kao u pacijenti.ts
  const pacijentRezultat = await pool.query("SELECT 1 FROM pacijenti WHERE id = $1 AND doktor_id = $2", [
    pacijentId,
    doktorId,
  ]);
  if (pacijentRezultat.rowCount === 0) {
    res.status(400).json({ error: "Pacijent nije pronadjen" });
    return;
  }

  // cena za stavke iz kataloga se uzima iz baze u trenutku narucivanja, nikad od klijenta —
  // inace bi doktor mogao da poturi izmenjenu (niziju) cenu protetičara
  const uslugaIdovi = [...new Set(stavke.map((stavka) => stavka.uslugaId).filter((id): id is string => Boolean(id)))];
  const cenaPoUslugaId = new Map<string, string>();
  if (uslugaIdovi.length > 0) {
    const uslugeRezultat = await pool.query<{ id: string; cena: string }>(
      "SELECT id, cena FROM usluge WHERE proteticar_id = $1 AND id = ANY($2::uuid[])",
      [proteticarId, uslugaIdovi],
    );
    for (const usluga of uslugeRezultat.rows) {
      cenaPoUslugaId.set(usluga.id, usluga.cena);
    }
    const nepoznataUslugaId = uslugaIdovi.find((id) => !cenaPoUslugaId.has(id));
    if (nepoznataUslugaId) {
      res.status(400).json({ error: `Usluga ${nepoznataUslugaId} ne postoji u katalogu ovog protetičara` });
      return;
    }
  }

  try {
    const porudzbina = await withTransaction(async (client) => {
      const porudzbinaRezultat = await client.query<PorudzbinaRed>(
        `INSERT INTO porudzbine (doktor_id, proteticar_id, pacijent_id)
         VALUES ($1, $2, $3)
         RETURNING id, doktor_id, proteticar_id, pacijent_id, status, rok_isporuke, datum_kreiranja, updated_at`,
        [doktorId, proteticarId, pacijentId],
      );
      const novaPorudzbina = porudzbinaRezultat.rows[0];

      const noveStavke: StavkaRed[] = [];
      for (const stavka of stavke) {
        // cena_u_trenutku: iz kataloga (uslugaId) ili sama poslata cena (slobodan opis, provereno u zod schemi)
        const cena = stavka.uslugaId ? cenaPoUslugaId.get(stavka.uslugaId)! : String(stavka.cena);
        const stavkaRezultat = await client.query<StavkaRed>(
          `INSERT INTO stavke_porudzbine (porudzbina_id, usluga_id, slobodan_opis, kolicina, cena_u_trenutku)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, porudzbina_id, usluga_id, slobodan_opis, kolicina, cena_u_trenutku, created_at`,
          [novaPorudzbina.id, stavka.uslugaId ?? null, stavka.slobodanOpis ?? null, stavka.kolicina, cena],
        );
        noveStavke.push(stavkaRezultat.rows[0]);
      }

      return { ...novaPorudzbina, stavke: noveStavke };
    });

    res.status(201).json({ porudzbina });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      res.status(400).json({ error: "Neispravna referenca na protetičara, pacijenta ili uslugu" });
      return;
    }
    throw error;
  }
});

porudzbineRouter.get("/", async (req: Request, res: Response) => {
  const { status, doktorId, proteticarId, page, pageSize } = req.query;
  const mojaFirmaId = req.auth!.firmaId;

  if (status !== undefined && (typeof status !== "string" || !SVI_STATUSI.includes(status as StatusPorudzbine))) {
    res.status(400).json({ error: `status mora biti jedan od: ${SVI_STATUSI.join(", ")}` });
    return;
  }
  if (doktorId !== undefined && typeof doktorId !== "string") {
    res.status(400).json({ error: "doktorId mora biti string" });
    return;
  }
  if (proteticarId !== undefined && typeof proteticarId !== "string") {
    res.status(400).json({ error: "proteticarId mora biti string" });
    return;
  }

  const brojStrane = page !== undefined ? Number(page) : 1;
  const velicinaStrane = pageSize !== undefined ? Number(pageSize) : 20;
  if (!Number.isInteger(brojStrane) || brojStrane < 1) {
    res.status(400).json({ error: "page mora biti pozitivan ceo broj" });
    return;
  }
  if (!Number.isInteger(velicinaStrane) || velicinaStrane < 1 || velicinaStrane > 100) {
    res.status(400).json({ error: "pageSize mora biti ceo broj izmedju 1 i 100" });
    return;
  }

  // COUNT(*) OVER() racuna ukupan broj redova (bez LIMIT-a) u istom upitu, bez posebnog COUNT query-ja
  const rezultat = await pool.query<
    PorudzbinaRed & {
      pacijent_ime: string;
      pacijent_prezime: string;
      doktor_naziv: string;
      proteticar_naziv: string;
      ukupno: string;
    }
  >(
    `SELECT p.id, p.doktor_id, p.proteticar_id, p.pacijent_id, p.status, p.rok_isporuke, p.datum_kreiranja, p.updated_at,
            pac.ime AS pacijent_ime, pac.prezime AS pacijent_prezime,
            d.naziv AS doktor_naziv, pr.naziv AS proteticar_naziv,
            COUNT(*) OVER() AS ukupno
     FROM porudzbine p
     JOIN pacijenti pac ON pac.id = p.pacijent_id
     JOIN firme d ON d.id = p.doktor_id
     JOIN firme pr ON pr.id = p.proteticar_id
     WHERE (p.doktor_id = $1 OR p.proteticar_id = $1)
       AND ($2::text IS NULL OR p.status = $2)
       AND ($3::uuid IS NULL OR p.doktor_id = $3)
       AND ($4::uuid IS NULL OR p.proteticar_id = $4)
     ORDER BY p.datum_kreiranja DESC
     LIMIT $5 OFFSET $6`,
    [
      mojaFirmaId,
      status ?? null,
      doktorId ?? null,
      proteticarId ?? null,
      velicinaStrane,
      (brojStrane - 1) * velicinaStrane,
    ],
  );

  const ukupno = rezultat.rows[0] ? Number(rezultat.rows[0].ukupno) : 0;
  const porudzbine = rezultat.rows.map(({ ukupno: _ukupno, ...red }) => red);

  res.status(200).json({ porudzbine, page: brojStrane, pageSize: velicinaStrane, total: ukupno });
});

porudzbineRouter.get("/:id", async (req: Request, res: Response) => {
  const mojaFirmaId = req.auth!.firmaId;

  const rezultat = await pool.query<
    PorudzbinaRed & {
      pacijent_ime: string;
      pacijent_prezime: string;
      doktor_naziv: string;
      proteticar_naziv: string;
    }
  >(
    `SELECT p.id, p.doktor_id, p.proteticar_id, p.pacijent_id, p.status, p.rok_isporuke, p.datum_kreiranja, p.updated_at,
            pac.ime AS pacijent_ime, pac.prezime AS pacijent_prezime,
            d.naziv AS doktor_naziv, pr.naziv AS proteticar_naziv
     FROM porudzbine p
     JOIN pacijenti pac ON pac.id = p.pacijent_id
     JOIN firme d ON d.id = p.doktor_id
     JOIN firme pr ON pr.id = p.proteticar_id
     WHERE p.id = $1 AND (p.doktor_id = $2 OR p.proteticar_id = $2)`,
    [req.params.id, mojaFirmaId],
  );

  const porudzbina = rezultat.rows[0];
  if (!porudzbina) {
    // ista poruka za "ne postoji" i "tudja porudzbina" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Porudzbina nije pronadjena" });
    return;
  }

  const stavkeRezultat = await pool.query<StavkaRed>(
    `SELECT id, porudzbina_id, usluga_id, slobodan_opis, kolicina, cena_u_trenutku, created_at
     FROM stavke_porudzbine
     WHERE porudzbina_id = $1
     ORDER BY created_at`,
    [porudzbina.id],
  );

  const otisciRezultat = await pool.query<OtisakRed>(
    `SELECT id, porudzbina_id, tip, fajl_path, napomena, created_at
     FROM otisci
     WHERE porudzbina_id = $1
     ORDER BY created_at`,
    [porudzbina.id],
  );

  res.status(200).json({
    porudzbina: { ...porudzbina, stavke: stavkeRezultat.rows, otisci: otisciRezultat.rows },
  });
});

porudzbineRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const parsed = patchPorudzbinaStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { status: noviStatus, rokIsporuke } = parsed.data;
  const mojaFirmaId = req.auth!.firmaId;
  const mojTip = req.auth!.tip;

  const postojecaRezultat = await pool.query<PorudzbinaRed>(
    `SELECT id, doktor_id, proteticar_id, pacijent_id, status, rok_isporuke, datum_kreiranja, updated_at
     FROM porudzbine WHERE id = $1`,
    [req.params.id],
  );
  const postojeca = postojecaRezultat.rows[0];

  if (!postojeca || (postojeca.doktor_id !== mojaFirmaId && postojeca.proteticar_id !== mojaFirmaId)) {
    // ista poruka za "ne postoji" i "nije moja porudzbina" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Porudzbina nije pronadjena" });
    return;
  }

  if (!DOZVOLJENE_TRANZICIJE[postojeca.status].includes(noviStatus)) {
    res.status(409).json({ error: `Prelaz iz statusa '${postojeca.status}' u '${noviStatus}' nije dozvoljen` });
    return;
  }

  if (TIP_KOJI_POSTAVLJA_STATUS[noviStatus] !== mojTip) {
    res.status(403).json({ error: "Nemate dozvolu da postavite ovaj status" });
    return;
  }

  // COALESCE cuva postojeci rok_isporuke ako novi nije poslat (npr. kod prelaza koji ga ne mijenja)
  const rezultat = await pool.query<PorudzbinaRed>(
    `UPDATE porudzbine
     SET status = $1, rok_isporuke = COALESCE($2, rok_isporuke), updated_at = now()
     WHERE id = $3
     RETURNING id, doktor_id, proteticar_id, pacijent_id, status, rok_isporuke, datum_kreiranja, updated_at`,
    [noviStatus, rokIsporuke ?? null, postojeca.id],
  );

  res.status(200).json({ porudzbina: rezultat.rows[0] });
});

// wrapper oko multer-a — bez ovoga bi npr. "fajl je preveliki" ili "nedozvoljen tip fajla"
// zavrsili na Express default error handleru (HTML stranica) umesto kao JSON 400
function uploadOtisak(req: Request, res: Response, next: NextFunction): void {
  upload.single("fajl")(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Neuspesan upload fajla" });
      return;
    }
    next();
  });
}

porudzbineRouter.post("/:id/otisak", uploadOtisak, async (req: Request, res: Response) => {
  const parsed = createOtisakSchema.safeParse(req.body);
  if (!parsed.success) {
    // fajl je vec sacuvan na disk (multer radi to pre nego sto stignemo do zod validacije) — ne ostavljamo siroce
    if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
    res.status(400).json({ error: "Neispravan zahtev", details: parsed.error.flatten() });
    return;
  }

  const { tip, napomena } = parsed.data;
  const mojaFirmaId = req.auth!.firmaId;

  const postojecaRezultat = await pool.query(
    `SELECT 1 FROM porudzbine WHERE id = $1 AND (doktor_id = $2 OR proteticar_id = $2)`,
    [req.params.id, mojaFirmaId],
  );
  if (postojecaRezultat.rowCount === 0) {
    if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
    // ista poruka za "ne postoji" i "tudja porudzbina" — ne otkrivamo tudje id-jeve
    res.status(404).json({ error: "Porudzbina nije pronadjena" });
    return;
  }

  if (tip === "digitalni" && !req.file) {
    res.status(400).json({ error: "Fajl je obavezan za digitalni otisak (multipart polje 'fajl')" });
    return;
  }
  if (tip === "analogni" && req.file) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    res.status(400).json({ error: "Analogni otisak se unosi samo kroz napomenu, bez fajla" });
    return;
  }

  const rezultat = await pool.query<OtisakRed>(
    `INSERT INTO otisci (porudzbina_id, tip, fajl_path, napomena)
     VALUES ($1, $2, $3, $4)
     RETURNING id, porudzbina_id, tip, fajl_path, napomena, created_at`,
    [req.params.id, tip, req.file ? otisakFajlPath(req.file.filename) : null, napomena ?? null],
  );

  res.status(201).json({ otisak: rezultat.rows[0] });
});
