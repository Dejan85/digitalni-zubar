import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import type { StatusTone } from "@/lib/order-status";

export interface ConnectionRow {
  id: string;
  name: string;
  contact: string;
  statusLabel: string;
  statusTone: StatusTone;
  // dugmad prihvati/odbij samo za primljene zahteve na čekanju
  canRespond: boolean;
}

export interface CompanyRow {
  id: string;
  name: string;
  contact: string;
  // null = može da se pošalje zahtev; inače razlog zašto ne (npr. "Zahtev poslat")
  disabledReason: string | null;
}

interface ConnectionsViewProps {
  counterpartPlural: string; // "Laboratorije" / "Ordinacije"
  tabs: { value: string; label: string; count: number }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  rows: ConnectionRow[];
  onRespond: (id: string, status: "prihvaceno" | "odbijeno") => void;
  respondingId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  searchResults: CompanyRow[];
  isSearching: boolean;
  onSendRequest: (companyId: string) => void;
  sendingId: string | null;
  isLoading: boolean;
  errorMessage?: string;
}

export function ConnectionsView(props: ConnectionsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-heading">{props.counterpartPlural}</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-heading">Moje veze</h2>
        <Tabs tabs={props.tabs} active={props.activeTab} onChange={props.onTabChange} />
        {props.errorMessage && <p className="mt-4 text-danger">{props.errorMessage}</p>}
        {props.isLoading && <p className="mt-4 text-muted">Učitavanje...</p>}
        {!props.isLoading && props.rows.length === 0 && <EmptyState title="Nema veza u ovoj kategoriji" />}
        <ul className="mt-2 flex flex-col divide-y divide-primary/10">
          {props.rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col">
                <span className="font-medium text-heading">{row.name}</span>
                <span className="text-xs text-muted">{row.contact}</span>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={row.statusLabel} tone={row.statusTone} />
                {row.canRespond && (
                  <>
                    <Button
                      variant="accent"
                      className="h-8 px-4"
                      disabled={props.respondingId === row.id}
                      onClick={() => props.onRespond(row.id, "prihvaceno")}
                    >
                      Prihvati
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 px-4"
                      disabled={props.respondingId === row.id}
                      onClick={() => props.onRespond(row.id, "odbijeno")}
                    >
                      Odbij
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-heading">Pronađi i pošalji zahtev</h2>
        <div className="mb-2 max-w-xs">
          <Input
            type="search"
            placeholder="Pretraga po nazivu"
            aria-label="Pretraga firmi"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </div>
        {props.isSearching && <p className="text-muted">Pretraga...</p>}
        {!props.isSearching && props.searchResults.length === 0 && <EmptyState title="Nema rezultata" />}
        <ul className="flex flex-col divide-y divide-primary/10">
          {props.searchResults.map((company) => (
            <li key={company.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col">
                <span className="font-medium text-heading">{company.name}</span>
                <span className="text-xs text-muted">{company.contact}</span>
              </div>
              {company.disabledReason ? (
                <span className="text-sm text-muted">{company.disabledReason}</span>
              ) : (
                <Button
                  variant="outline"
                  className="h-8 px-4"
                  disabled={props.sendingId === company.id}
                  onClick={() => props.onSendRequest(company.id)}
                >
                  Pošalji zahtev
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
