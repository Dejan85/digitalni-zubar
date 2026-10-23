"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { login } from "@/lib/endpoints";

const loginSchema = z.object({
  email: z.email("Email nije validan"),
  password: z.string().min(1, "Lozinka je obavezna"),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const message = useSearchParams().get("message");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { token } = await login(values.email, values.password);
      signIn(token);
      router.replace("/dashboard");
    } catch (e) {
      if (e instanceof ApiError) {
        setFormError(e.status === 429 ? "Previše pokušaja. Pokušaj ponovo za 15 minuta." : e.message);
      } else {
        setFormError("Došlo je do greške");
      }
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">Prijava</h2>
      {message && <p className="mb-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">{message}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Lozinka" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
