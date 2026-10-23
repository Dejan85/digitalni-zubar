import rateLimit from "express-rate-limit";

// ograniceno na /auth/* (register + login) — sprecava brute-force pogadjanje lozinke i spam registracija;
// ostale rute vec zahtevaju validan JWT pa su prirodno manje izlozene ovom napadu
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  // integration testovi u jednom test procesu lako naprave desetine register/login poziva u par sekundi;
  // NODE_ENV=test (postavlja ga i sam vitest) podize limit da testovi ne padaju na 429 umesto na pravu proveru
  limit: process.env.NODE_ENV === "test" ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Previse pokusaja, pokusajte ponovo kasnije" },
});
