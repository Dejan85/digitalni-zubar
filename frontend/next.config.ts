import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // (app) zona je client-only iza login kapije (JWT u localStorage), pa implicitna validacija "instant navigation"
    // samo prijavljuje lažno upozorenje; validiraju se samo segmenti koji izričito traže `instant`
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
