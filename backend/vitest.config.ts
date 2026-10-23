import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // svi test fajlovi dele istu Postgres test bazu (resetDb pre svakog testa) — paralelni fajlovi
    // bi trkali TRUNCATE i insert-e jedni drugima, pa fajlovi idu sekvencijalno
    fileParallelism: false,
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
