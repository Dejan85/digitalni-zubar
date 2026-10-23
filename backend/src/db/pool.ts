import { Pool, types } from "pg";

import "dotenv/config";

// pg default parsira DATE (OID 1082) u JS Date na ponoc po LOKALNOM vremenu servera;
// JSON.stringify onda zove toISOString() (UTC), sto za pozitivan UTC offset (npr. Srbija)
// pomeri datum jedan dan unazad (1990-05-15 -> "1990-05-14T22:00:00.000Z").
// Vracamo sirov "YYYY-MM-DD" string umesto Date objekta da izbegnemo tu konverziju.
types.setTypeParser(types.builtins.DATE, (value: string) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
