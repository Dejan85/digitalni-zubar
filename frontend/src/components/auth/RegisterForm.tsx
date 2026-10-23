import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";

type FieldName = "companyName" | "type" | "address" | "phone" | "companyEmail" | "email" | "password";

interface RegisterFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function RegisterForm({ fields, errors, formError, isSubmitting, onSubmit }: RegisterFormProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">Registracija firme</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Naziv firme" htmlFor="companyName" error={errors.companyName?.message}>
          <Input id="companyName" aria-invalid={!!errors.companyName} {...fields.companyName} />
        </Field>
        <Field label="Tip firme" htmlFor="type" error={errors.type?.message}>
          <Select id="type" {...fields.type}>
            <option value="doktor">Stomatološka ordinacija (doktor)</option>
            <option value="proteticar">Zubotehnička laboratorija (protetičar)</option>
          </Select>
        </Field>
        <Field label="Adresa (opciono)" htmlFor="address">
          <Input id="address" {...fields.address} />
        </Field>
        <Field label="Telefon (opciono)" htmlFor="phone">
          <Input id="phone" type="tel" {...fields.phone} />
        </Field>
        <Field label="Kontakt email firme (opciono)" htmlFor="companyEmail" error={errors.companyEmail?.message}>
          <Input id="companyEmail" type="email" aria-invalid={!!errors.companyEmail} {...fields.companyEmail} />
        </Field>

        <hr className="border-primary/15" />

        <Field label="Email za prijavu" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...fields.email} />
        </Field>
        <Field label="Lozinka" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...fields.password}
          />
        </Field>
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? "Registracija..." : "Registruj se"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Već imaš nalog?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Prijavi se
        </Link>
      </p>
    </Card>
  );
}
