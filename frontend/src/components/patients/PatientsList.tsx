import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Field";

export interface PatientRow {
  id: string;
  fullName: string;
  birthDate: string;
  genderLabel: string;
}

interface PatientsListProps {
  rows: PatientRow[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  // modali (forma / potvrda brisanja) renderuje container
  children?: ReactNode;
}

const HEAD = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted";
const CELL = "px-4 py-3 text-sm";

export function PatientsList(props: PatientsListProps) {
  const { rows, isLoading, errorMessage } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-heading">Pacijenti</h1>
        <Button variant="accent" onClick={props.onCreate}>
          Novi pacijent
        </Button>
      </div>
      <Card>
        <div className="mb-4 max-w-xs">
          <Input
            type="search"
            placeholder="Pretraga po imenu ili prezimenu"
            aria-label="Pretraga pacijenata"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </div>
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        {isLoading && <p className="text-muted">Učitavanje...</p>}
        {!isLoading && !errorMessage && rows.length === 0 && (
          <EmptyState title="Nema pacijenata" description="Dodaj prvog pacijenta ili promeni pretragu." />
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className={HEAD}>Ime i prezime</th>
                  <th className={HEAD}>Datum rođenja</th>
                  <th className={HEAD}>Pol</th>
                  <th className={HEAD} />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-primary/10 last:border-0">
                    <td className={`${CELL} font-medium`}>
                      <Link href={`/patients/${row.id}`} className="text-heading hover:underline">
                        {row.fullName}
                      </Link>
                    </td>
                    <td className={CELL}>{row.birthDate}</td>
                    <td className={CELL}>{row.genderLabel}</td>
                    <td className={CELL}>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="h-8 px-4" onClick={() => props.onEdit(row.id)}>
                          Izmeni
                        </Button>
                        <Button variant="outline" className="h-8 px-4 text-danger" onClick={() => props.onDelete(row.id)}>
                          Obriši
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {props.children}
    </div>
  );
}
