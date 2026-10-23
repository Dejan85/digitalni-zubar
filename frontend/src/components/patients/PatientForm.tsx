import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

type FieldName = "firstName" | "lastName" | "birthDate" | "gender";

interface PatientFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export function PatientForm({ fields, errors, formError, isSubmitting, submitLabel, onSubmit, onCancel }: PatientFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Ime" htmlFor="firstName" error={errors.firstName?.message}>
        <Input id="firstName" aria-invalid={!!errors.firstName} {...fields.firstName} />
      </Field>
      <Field label="Prezime" htmlFor="lastName" error={errors.lastName?.message}>
        <Input id="lastName" aria-invalid={!!errors.lastName} {...fields.lastName} />
      </Field>
      <Field label="Datum rođenja" htmlFor="birthDate" error={errors.birthDate?.message}>
        <Input id="birthDate" type="date" aria-invalid={!!errors.birthDate} {...fields.birthDate} />
      </Field>
      <Field label="Pol" htmlFor="gender" error={errors.gender?.message}>
        <Select id="gender" {...fields.gender}>
          <option value="M">Muški</option>
          <option value="Z">Ženski</option>
        </Select>
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
