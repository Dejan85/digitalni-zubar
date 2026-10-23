import { NextFunction, Request, Response } from "express";

import { AuthTokenPayload, verifyAuthToken } from "../auth/jwt";

// dodaje "auth" polje na svaki Request u celoj aplikaciji, ne samo u ovom fajlu,
// tako da req.auth ima tip (a ne "any") u svim rutama koje dodju posle ovog middleware-a
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Nedostaje Authorization: Bearer <token> header" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Nevazeci ili istekao token" });
  }
}
