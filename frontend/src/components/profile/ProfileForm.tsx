import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

type FieldName = "address" | "phone" | "email";

interface ProfileFormProps {
  companyName?: string;
  companyTypeLabel?: string;
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  successMessage: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ProfileForm(props: ProfileFormProps) {
  const { errors, fields } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-heading">{props.companyName ?? "Profil"}</h1>
        {props.companyTypeLabel && <span className="text-sm text-muted">{props.companyTypeLabel}</span>}
      </div>
      <Card>
        {props.isLoading ? (
          <p className="text-muted">Učitavanje...</p>
        ) : (
          <form onSubmit={props.onSubmit} className="grid max-w-xl gap-4" noValidate>
            <Field label="Adresa" htmlFor="address" error={errors.address?.message}>
              <Input id="address" {...fields.address} />
            </Field>
            <Field label="Telefon" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...fields.phone} />
            </Field>
            <Field label="Kontakt email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" aria-invalid={!!errors.email} {...fields.email} />
            </Field>
            {props.formError && (
              <p role="alert" className="text-sm text-danger">
                {props.formError}
              </p>
            )}
            {props.successMessage && <p className="text-sm text-primary">{props.successMessage}</p>}
            <div>
              <Button type="submit" variant="accent" disabled={props.isSubmitting}>
                {props.isSubmitting ? "Čuvanje..." : "Sačuvaj izmene"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
