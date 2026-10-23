import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";

export interface ServiceRow {
  id: string;
  name: string;
  price: string;
  technicianName: string;
}

export interface TechnicianOption {
  id: string;
  name: string;
}

interface ServicesViewProps {
  title: string;
  rows: ServiceRow[];
  // protetičar upravlja katalogom, doktor ga samo pregleda
  canManage: boolean;
  // super admin upravlja svim katalozima, ali novu uslugu može da doda tek kad izabere laboratoriju
  canCreate?: boolean;
  // kolona sa laboratorijom (podrazumevano samo kad ne upravljaš sopstvenim katalogom)
  showTechnician?: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // filter po protetičaru (samo doktor)
  technicianOptions?: TechnicianOption[];
  technicianFilter: string;
  onTechnicianFilterChange: (value: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  // modali (forma / potvrda brisanja) renderuje container
  children?: ReactNode;
}

const HEAD = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted";
const CELL = "px-4 py-3 text-sm";

export function ServicesView(props: ServicesViewProps) {
  const { rows, canManage, isLoading, errorMessage } = props;
  const canCreate = props.canCreate ?? canManage;
  const showTechnician = props.showTechnician ?? !canManage;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-heading">{props.title}</h1>
        {canCreate && (
          <Button variant="accent" onClick={props.onCreate}>
            Nova usluga
          </Button>
        )}
      </div>
      <Card>
        {props.technicianOptions && (
          <div className="mb-4 max-w-xs">
            <Select
              aria-label="Filter po laboratoriji"
              value={props.technicianFilter}
              onChange={(e) => props.onTechnicianFilterChange(e.target.value)}
            >
              <option value="">Sve povezane laboratorije</option>
              {props.technicianOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        {isLoading && <p className="text-muted">Učitavanje...</p>}
        {!isLoading && !errorMessage && rows.length === 0 && (
          <EmptyState
            title="Nema usluga"
            description={canManage ? "Dodaj prvu uslugu u svoj katalog." : "Povezane laboratorije još nemaju usluge u katalogu."}
          />
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className={HEAD}>Usluga</th>
                  {showTechnician && <th className={HEAD}>Laboratorija</th>}
                  <th className={`${HEAD} text-right`}>Cena</th>
                  {canManage && <th className={HEAD} />}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-primary/10 last:border-0">
                    <td className={`${CELL} font-medium text-heading`}>{row.name}</td>
                    {showTechnician && <td className={CELL}>{row.technicianName}</td>}
                    <td className={`${CELL} text-right tabular-nums`}>{row.price}</td>
                    {canManage && (
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
                    )}
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
