import { pool } from "../../src/db/pool";

// redosled nije bitan — TRUNCATE ... CASCADE u jednoj komandi resava FK zavisnosti sam,
// za razliku od DELETE FROM po tabeli gde bi redosled morao rucno da se pazi
const SVE_TABELE = [
  "firme",
  "korisnici",
  "doktor_specijalizacije",
  "veze_doktor_proteticar",
  "pacijenti",
  "usluge",
  "porudzbine",
  "stavke_porudzbine",
  "otisci",
  "beleske",
];

// zove se pre svakog testa (beforeEach) — svaki test kreze od prazne baze, bez uticaja prethodnih testova
export async function resetDb(): Promise<void> {
  await pool.query(`TRUNCATE TABLE ${SVE_TABELE.join(", ")} RESTART IDENTITY CASCADE`);
}

// zatvara pool konekcija na kraju test fajla — bez ovoga vitest ne moze cisto da izadje (otvorene handle-ove)
export async function closeDb(): Promise<void> {
  await pool.end();
}
