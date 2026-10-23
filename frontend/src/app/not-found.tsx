import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-heading">Stranica nije pronađena</h1>
      <p className="text-muted">Stranica koju tražiš ne postoji ili još nije dostupna.</p>
      <Link href="/dashboard" className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white">
        Nazad na pregled
      </Link>
    </main>
  );
}
