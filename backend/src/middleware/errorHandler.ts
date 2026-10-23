import { NextFunction, Request, Response } from "express";

// pg error code -> (status, poruka) za greske koje rute ne hvataju posebno (fallback, ne zamena za
// namerne provere kao npr. isUniqueViolation u auth.ts koje daju precizniju poruku)
const PG_ERROR_KODOVI: Record<string, { status: number; poruka: string }> = {
  "23505": { status: 409, poruka: "Zapis vec postoji (konflikt)" },
  "23503": { status: 400, poruka: "Neispravna referenca na povezani zapis" },
  "23502": { status: 400, poruka: "Nedostaje obavezno polje" },
  "23514": { status: 400, poruka: "Vrednost polja krsi ogranicenje baze" },
  // 22P02 = invalid_text_representation, npr. UUID/broj sa neispravnim formatom prosledjen u upit
  "22P02": { status: 400, poruka: "Neispravan format podatka u zahtevu" },
};

function pgErrorKod(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const kod = (error as { code?: unknown }).code;
    if (typeof kod === "string") return kod;
  }
  return undefined;
}

// mora imati tacno 4 parametra (err, req, res, next) - po tome Express prepoznaje error-handling middleware
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  // pun error (sa stack trace-om) ide samo u server log, nikad klijentu
  console.error(err);

  const kod = pgErrorKod(err);
  const poznataGreska = kod ? PG_ERROR_KODOVI[kod] : undefined;

  if (poznataGreska) {
    res.status(poznataGreska.status).json({ error: poznataGreska.poruka });
    return;
  }

  res.status(500).json({ error: "Doslo je do greske na serveru" });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Ruta nije pronadjena" });
}
