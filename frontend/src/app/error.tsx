"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ retry }: { error: Error; retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-heading">Došlo je do greške</h1>
      <p className="text-muted">Nešto je pošlo naopako. Pokušaj ponovo.</p>
      <Button onClick={() => retry()}>Pokušaj ponovo</Button>
    </main>
  );
}
