import { PoolClient } from "pg";

import { pool } from "./pool";

// Uzima jednu konekciju iz pool-a i vodi je kroz BEGIN/COMMIT/ROLLBACK,
// tako da vise upita (npr. insert u firme + insert u korisnici) prolazi ili u celosti, ili nikako.
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // konekcija se uvek vraca u pool, uspesno ili ne
    client.release();
  }
}
