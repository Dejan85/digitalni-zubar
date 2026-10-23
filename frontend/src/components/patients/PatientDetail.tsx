import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Field";

export interface NoteRow {
  id: string;
  text: string;
  date: string;
  isAutomatic: boolean;
}

interface PatientDetailProps {
  fullName?: string;
  birthDate?: string;
  genderLabel?: string;
  notes: NoteRow[];
  noteField: UseFormRegisterReturn;
  noteError?: string;
  isAddingNote: boolean;
  onAddNote: FormEventHandler<HTMLFormElement>;
  isLoading: boolean;
  errorMessage?: string;
}

export function PatientDetail(props: PatientDetailProps) {
  if (props.isLoading) return <p className="text-muted">Učitavanje...</p>;
  if (props.errorMessage) return <p className="text-danger">{props.errorMessage}</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-heading">{props.fullName}</h1>
      <Card>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Datum rođenja</dt>
            <dd className="text-sm">{props.birthDate}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Pol</dt>
            <dd className="text-sm">{props.genderLabel}</dd>
          </div>
        </dl>
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
