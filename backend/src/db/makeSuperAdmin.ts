import { pool } from "./pool";

// npm run make-admin -- <email> [--revoke]
// jedini nacin da se postavi (ili skine) super admin flag — namerno nema API rute za to
async function main(): Promise<void> {
  const [email, ...flags] = process.argv.slice(2);
  if (!email) {
    throw new Error("Upotreba: npm run make-admin -- <email> [--revoke]");
  }
  const vrednost = !flags.includes("--revoke");

  const rezultat = await pool.query<{ email: string; is_super_admin: boolean }>(
    "UPDATE korisnici SET is_super_admin = $2, updated_at = now() WHERE email = $1 RETURNING email, is_super_admin",
    [email, vrednost],
  );

  if (rezultat.rowCount === 0) {
    throw new Error(`Korisnik ${email} ne postoji`);
  }
  const red = rezultat.rows[0];
  console.log(
    `${red.email}: is_super_admin = ${red.is_super_admin} (potrebna nova prijava da token dobije novu vrednost)`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
