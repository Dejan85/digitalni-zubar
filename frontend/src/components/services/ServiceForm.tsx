import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

type FieldName = "name" | "price";

interface ServiceFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export function ServiceForm({ fields, errors, formError, isSubmitting, submitLabel, onSubmit, onCancel }: ServiceFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Naziv usluge" htmlFor="name" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...fields.name} />
      </Field>
      <Field label="Cena (RSD)" htmlFor="price" error={errors.price?.message}>
        <Input id="price" type="number" step="0.01" min="0" inputMode="decimal" aria-invalid={!!errors.price} {...fields.price} />
      </Field>
      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Otkaži
        </Button>
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
