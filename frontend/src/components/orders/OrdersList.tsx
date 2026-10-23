import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/lib/order-status";

export interface OrderRow {
  id: string;
  patientName: string;
  counterpartName: string;
  statusLabel: string;
  statusTone: StatusTone;
  deadline: string;
  createdAt: string;
}

interface OrdersListProps {
  rows: OrderRow[];
  counterpartHeader: string;
  statusOptions: { value: string; label: string }[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  errorMessage?: string;
}

const HEAD = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted";
const CELL = "px-4 py-3 text-sm";

export function OrdersList(props: OrdersListProps) {
  const { rows, isLoading, errorMessage } = props;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-heading">Porudžbine</h1>
      <Card>
        <div className="mb-4 max-w-xs">
          <Field label="Status" htmlFor="status-filter">
            <Select
              id="status-filter"
              value={props.statusFilter}
              onChange={(e) => props.onStatusFilterChange(e.target.value)}
            >
              <option value="">Svi statusi</option>
              {props.statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        {isLoading && <p className="text-muted">Učitavanje...</p>}
        {!isLoading && !errorMessage && rows.length === 0 && (
          <EmptyState title="Nema porudžbina" description="Nijedna porudžbina ne odgovara izabranom filteru." />
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className={HEAD}>Pacijent</th>
                  <th className={HEAD}>{props.counterpartHeader}</th>
                  <th className={HEAD}>Status</th>
                  <th className={HEAD}>Rok isporuke</th>
                  <th className={HEAD}>Kreirana</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-primary/10 last:border-0">
                    <td className={`${CELL} font-medium text-heading`}>{row.patientName}</td>
                    <td className={CELL}>{row.counterpartName}</td>
                    <td className={CELL}>
                      <StatusBadge label={row.statusLabel} tone={row.statusTone} />
                    </td>
                    <td className={CELL}>{row.deadline}</td>
                    <td className={CELL}>{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={props.page} totalPages={props.totalPages} onPageChange={props.onPageChange} />
      </Card>
    </div>
  );
}
