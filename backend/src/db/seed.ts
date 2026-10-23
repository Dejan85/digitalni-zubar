import { pool } from "./pool";

async function seed(): Promise<void> {
  // placeholder dok ne postoje tabele (Faza 2) — potvrdjuje da seed skripta
  // moze da se konektuje na bazu preko istog pool-a kao i aplikacija
  const result = await pool.query("SELECT NOW() AS now");
  console.log("Konekcija na bazu radi, vreme na serveru:", result.rows[0].now);

  // TODO: ubaciti test podatke (firme, korisnici, pacijenti...) kad tabele iz Faze 2 postoje
}

seed()
  .catch((error: unknown) => {
    console.error("Seed nije uspeo:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
