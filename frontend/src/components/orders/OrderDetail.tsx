import Link from "next/link";
import type { ChangeEvent, FormEventHandler, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/lib/order-status";

export interface OrderItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface ImpressionRow {
  id: string;
  typeLabel: string;
  detail: string;
}

export interface OrderNoteRow {
  id: string;
  text: string;
  date: string;
  isAutomatic: boolean;
}

export interface StatusAction {
  status: string;
  label: string;
  isDestructive: boolean;
}

interface OrderDetailProps {
  patientName?: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  doctorName?: string;
  technicianName?: string;
  deadline?: string;
  createdAt?: string;
  items: OrderItemRow[];
  total: string;
  impressions: ImpressionRow[];
  notes: OrderNoteRow[];
  noteField: UseFormRegisterReturn;
  noteError?: string;
  isAddingNote: boolean;
  onAddNote: FormEventHandler<HTMLFormElement>;
  actions: StatusAction[];
  needsDeadline: boolean;
  deadlineValue: string;
  onDeadlineChange: (value: string) => void;
  actionError?: string;
  isUpdatingStatus: boolean;
  onAction: (status: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}

const HEAD = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted";
const CELL = "px-4 py-3 text-sm";

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function OrderDetail(props: OrderDetailProps) {
  if (props.isLoading) return <p className="text-muted">Učitavanje...</p>;
  if (props.errorMessage) return <p className="text-danger">{props.errorMessage}</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/orders" className="text-sm text-muted hover:underline">
        ← Porudžbine
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-heading">Porudžbina — {props.patientName}</h1>
        {props.statusLabel && props.statusTone && <StatusBadge label={props.statusLabel} tone={props.statusTone} />}
      </div>

      <Card>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Ordinacija">{props.doctorName}</InfoItem>
          <InfoItem label="Laboratorija">{props.technicianName}</InfoItem>
          <InfoItem label="Rok isporuke">{props.deadline}</InfoItem>
          <InfoItem label="Kreirana">{props.createdAt}</InfoItem>
        </dl>
      </Card>

      {(props.actions.length > 0 || props.actionError) && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-heading">Promena statusa</h2>
          {props.needsDeadline && (
            <div className="mb-4 max-w-xs">
              <Field label="Rok isporuke (obavezno za potvrdu)" htmlFor="deadline">
                <Input
                  id="deadline"
                  type="date"
                  value={props.deadlineValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => props.onDeadlineChange(e.target.value)}
                />
              </Field>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {props.actions.map((action) => (
              <Button
                key={action.status}
                type="button"
                variant={action.isDestructive ? "outline" : "accent"}
                disabled={props.isUpdatingStatus}
                onClick={() => props.onAction(action.status)}
              >
                {action.label}
              </Button>
            ))}
          </div>
          {props.actionError && (
            <p role="alert" className="mt-3 text-xs text-danger">
              {props.actionError}
            </p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-heading">Stavke</h2>
        {props.items.length === 0 ? (
          <EmptyState title="Nema stavki" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className={HEAD}>Opis</th>
                  <th className={HEAD}>Količina</th>
                  <th className={HEAD}>Cena</th>
                  <th className={HEAD}>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {props.items.map((item) => (
                  <tr key={item.id} className="border-b border-primary/10 last:border-0">
                    <td className={`${CELL} font-medium text-heading`}>{item.description}</td>
                    <td className={CELL}>{item.quantity}</td>
                    <td className={CELL}>{item.unitPrice}</td>
                    <td className={CELL}>{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-right text-sm font-semibold text-heading">Ukupno: {props.total}</p>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-heading">Otisci</h2>
        {props.impressions.length === 0 ? (
          <EmptyState title="Nema otisaka" />
        ) : (
          <ul className="flex flex-col divide-y divide-primary/10">
            {props.impressions.map((impression) => (
              <li key={impression.id} className="flex flex-col gap-1 py-3">
                <span className="text-xs text-muted">{impression.typeLabel}</span>
                <span className="text-sm">{impression.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-heading">Beleške</h2>
        <form onSubmit={props.onAddNote} className="mb-4 flex flex-wrap gap-2" noValidate>
          <Input
            placeholder="Nova beleška..."
            aria-label="Tekst beleške"
            aria-invalid={!!props.noteError}
            className="min-w-60 flex-1"
            {...props.noteField}
          />
          <Button type="submit" variant="accent" disabled={props.isAddingNote}>
            Dodaj
          </Button>
        </form>
        {props.noteError && <p className="mb-2 text-xs text-danger">{props.noteError}</p>}
        {props.notes.length === 0 ? (
          <EmptyState title="Nema beleški" />
        ) : (
          <ul className="flex flex-col divide-y divide-primary/10">
            {props.notes.map((note) => (
              <li key={note.id} className="flex flex-col gap-1 py-3">
                <span className="text-xs text-muted">
                  {note.date}
                  {note.isAutomatic && " · automatska"}
                </span>
                <span className="text-sm">{note.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
