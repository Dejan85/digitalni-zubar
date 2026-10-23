import { NextFunction, Request, Response } from "express";

import { TipFirme } from "../auth/jwt";

// mora ici POSLE requireAuth (oslanja se na req.auth) — npr. requireTip("proteticar")
// stiti rute koje sme da zove samo firma tog tipa (npr. izmena kataloga usluga)
export function requireTip(...dozvoljeniTipovi: TipFirme[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "Nedostaje Authorization: Bearer <token> header" });
      return;
    }

    // super admin prolazi svaku rutu bez obzira na tip firme (vlasnik aplikacije, nalog se ne koristi u produkciji)
    if (req.auth.superAdmin) {
      next();
      return;
    }

    if (!dozvoljeniTipovi.includes(req.auth.tip)) {
      res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      return;
    }

    next();
  };
}
