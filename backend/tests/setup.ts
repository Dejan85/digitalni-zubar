import path from "node:path";

import dotenv from "dotenv";

// mora se izvrsiti PRE nego sto bilo koji test fajl uveze src/app (preko src/db/pool.ts, koji cita
// process.env.DATABASE_URL odmah pri importu, ne unutar funkcije) — vitest garantuje da se setupFiles
// izvrse pre ucitavanja test fajlova, tako da je ovo prvi kod koji dira process.env u celom test run-u.
// override: true je neophodan jer src/db/pool.ts sam radi "import 'dotenv/config'" (ucitava .env, ne
// .env.test) — bez override-a bi ta linija bila no-op posto dotenv po defaultu ne pregazi vec setovan env.
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true });

if (process.env.DATABASE_URL?.includes("_test") !== true) {
  throw new Error(
    "DATABASE_URL iz .env.test ne sadrzi '_test' u imenu baze — testovi rade TRUNCATE na tabelama " +
      "i pokretanje protiv pogresne (dev) baze bi obrisalo prave podatke. Proveri backend/.env.test.",
  );
}
