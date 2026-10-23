import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/Field";

export interface NewOrderValues {
  technicianId: string;
  patientId: string;
  items: {
    mode: "catalog" | "free";
    serviceId: string;
    freeDescription: string;
    quantity: string;
    price: string;
  }[];
}

export interface Option {
  value: string;
  label: string;
}

interface NewOrderFormProps {
  register: UseFormRegister<NewOrderValues>;
  errors: FieldErrors<NewOrderValues>;
  technicianOptions: Option[];
  patientOptions: Option[];
  serviceOptions: Option[];
  hasTechnician: boolean;
  itemModes: ("catalog" | "free")[];
  itemLineTotals: string[]; // već formatirano, "" kad se ne može izračunati
  total: string;
  itemsCount: number;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function NewOrderForm(props: NewOrderFormProps) {
  const { register, errors } = props;

  if (props.technicianOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-heading">Nova porudžbina</h1>
        <Card>
          <EmptyState
            title="Nema povezanih laboratorija"
            description="Porudžbina je moguća samo sa laboratorijom sa kojom imate prihvaćenu vezu."
          />
          <div className="mt-4 flex justify-center">
            <Link href="/connections" className="text-heading underline">
              Idi na veze
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (props.patientOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-heading">Nova porudžbina</h1>
        <Card>
          <EmptyState title="Nemate pacijenata" description="Porudžbina se pravi za pacijenta. Prvo dodaj pacijenta." />
          <div className="mt-4 flex justify-center">
            <Link href="/patients" className="text-heading underline">
              Idi na pacijente
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={props.onSubmit} className="flex flex-col gap-6" noValidate>
      <h1 className="text-xl font-semibold text-heading">Nova porudžbina</h1>

      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Laboratorija" htmlFor="technicianId" error={errors.technicianId?.message}>
          <Select id="technicianId" aria-invalid={!!errors.technicianId} {...register("technicianId")}>
            <option value="">Izaberi laboratoriju</option>
            {props.technicianOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pacijent" htmlFor="patientId" error={errors.patientId?.message}>
          <Select id="patientId" aria-invalid={!!errors.patientId} {...register("patientId")}>
            <option value="">Izaberi pacijenta</option>
            {props.patientOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-heading">Stavke</h2>
        {errors.items?.root?.message && (
          <p role="alert" className="text-xs text-danger">
            {errors.items.root.message}
          </p>
        )}
        {Array.from({ length: props.itemsCount }, (_, i) => {
          const itemErrors = errors.items?.[i];
          const mode = props.itemModes[i];
          return (
            <div key={i} className="grid gap-3 rounded-xl border border-primary/15 p-4 md:grid-cols-[10rem_1fr_6rem_9rem_auto]">
              <Field label="Vrsta" htmlFor={`items-${i}-mode`}>
                <Select id={`items-${i}-mode`} {...register(`items.${i}.mode`)}>
                  <option value="catalog">Iz kataloga</option>
                  <option value="free">Slobodan opis</option>
                </Select>
              </Field>
              {mode === "catalog" ? (
                <Field label="Usluga" htmlFor={`items-${i}-service`} error={itemErrors?.serviceId?.message}>
                  <Select
                    id={`items-${i}-service`}
                    disabled={!props.hasTechnician}
                    aria-invalid={!!itemErrors?.serviceId}
                    {...register(`items.${i}.serviceId`)}
                  >
                    <option value="">{props.hasTechnician ? "Izaberi uslugu" : "Prvo izaberi laboratoriju"}</option>
                    {props.serviceOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Opis" htmlFor={`items-${i}-desc`} error={itemErrors?.freeDescription?.message}>
                  <Input
                    id={`items-${i}-desc`}
                    aria-invalid={!!itemErrors?.freeDescription}
                    {...register(`items.${i}.freeDescription`)}
                  />
                </Field>
              )}
              <Field label="Količina" htmlFor={`items-${i}-qty`} error={itemErrors?.quantity?.message}>
                <Input
                  id={`items-${i}-qty`}
                  type="number"
                  min={1}
                  aria-invalid={!!itemErrors?.quantity}
                  {...register(`items.${i}.quantity`)}
                />
              </Field>
              {mode === "free" ? (
                <Field label="Cena (RSD)" htmlFor={`items-${i}-price`} error={itemErrors?.price?.message}>
                  <Input
                    id={`items-${i}-price`}
                    inputMode="decimal"
                    aria-invalid={!!itemErrors?.price}
                    {...register(`items.${i}.price`)}
                  />
                </Field>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-heading">Iznos</span>
                  <span className="flex h-11 items-center text-sm">{props.itemLineTotals[i] || "—"}</span>
                </div>
              )}
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={props.itemsCount === 1}
                  aria-label={`Ukloni stavku ${i + 1}`}
                  onClick={() => props.onRemoveItem(i)}
                >
                  Ukloni
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={props.onAddItem}>
            Dodaj stavku
          </Button>
          <p className="text-sm">
            Ukupno: <span className="font-semibold text-heading">{props.total}</span>
          </p>
        </div>
      </Card>

      {props.formError && (
        <p role="alert" className="text-sm text-danger">
          {props.formError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Link
          href="/orders"
          className="inline-flex h-11 items-center rounded-full border border-primary/30 px-6 text-sm font-medium text-heading hover:bg-primary-soft"
        >
          Otkaži
        </Link>
        <Button type="submit" variant="accent" disabled={props.isSubmitting}>
          {props.isSubmitting ? "Slanje..." : "Pošalji porudžbinu"}
        </Button>
      </div>
    </form>
  );
}
