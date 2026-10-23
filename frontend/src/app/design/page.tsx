import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatCard } from "@/components/ui/StatCard";

// privremena stranica za pregled dizajn sistema (tokeni, dugmad, kartice) — menja se pravim ekranima
const STATUSES = ["primljena", "potvrđena", "u izradi", "poslata", "isporučena"];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d={d} />
    </svg>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-12">
      <section className="rounded-card bg-surface-tint p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">Digitalni zubar</h1>
        <p className="mt-2 max-w-xl text-muted">
          Porudžbine, otisci i praćenje statusa između ordinacije i zubotehničke laboratorije.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="accent">Nova porudžbina</Button>
          <Button variant="primary">Prijava</Button>
          <Button variant="outline">Pregled pacijenata</Button>
          <Button variant="dark">Veze</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Aktivne porudžbine" value={24} hint="u izradi i poslate" icon={<Icon d="M4 6h16M4 12h16M4 18h10" />} />
        <StatCard label="Isporučeno ovog meseca" value={87} hint="+12 u odnosu na prošli" icon={<Icon d="M5 13l4 4L19 7" />} />
        <StatCard label="Rok ističe uskoro" value={5} hint="u naredna 2 dana" tone="dark" icon={<Icon d="M12 8v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" />} />
      </section>

      <Card>
        <div className="flex items-center gap-3">
          <IconBadge tone="solid" shape="circle">
            <Icon d="M9 12l2 2 4-4" />
          </IconBadge>
          <h2 className="text-lg font-semibold">Tok statusa porudžbine</h2>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {STATUSES.map((status, i) => (
            <span
              key={status}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${i < 3 ? "bg-primary text-white" : "bg-primary-soft text-heading"}`}
            >
              {status}
            </span>
          ))}
        </div>
      </Card>
    </main>
  );
}
