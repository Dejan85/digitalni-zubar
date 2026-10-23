import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

interface LoginFormProps {
  fields: { email: UseFormRegisterReturn; password: UseFormRegisterReturn };
  errors: { email?: FieldError; password?: FieldError };
  formError: string | null;
  notice: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function LoginForm({ fields, errors, formError, notice, isSubmitting, onSubmit }: LoginFormProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">Prijava</h2>
      {notice && <p className="mb-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">{notice}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...fields.email} />
        </Field>
        <Field label="Lozinka" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
          {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Nemaš nalog?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Registruj firmu
        </Link>
      </p>
    </Card>
  );
}
