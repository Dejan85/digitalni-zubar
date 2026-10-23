"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { register as registerCompany } from "@/lib/endpoints";

const registerSchema = z.object({
  companyName: z.string().min(1, "Naziv firme je obavezan"),
  type: z.enum(["doktor", "proteticar"]),
  address: z.string(),
  phone: z.string(),
  companyEmail: z.string().refine((v) => v === "" || z.email().safeParse(v).success, "Email nije validan"),
  email: z.email("Email nije validan"),
  password: z.string().min(8, "Lozinka mora imati bar 8 karaktera"),
});
type RegisterValues = z.infer<typeof registerSchema>;

// prazna polja iz forme su "", a backend traži izostavljeno polje
const emptyToUndefined = (value: string) => (value.trim() === "" ? undefined : value.trim());

export default function RegisterPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { type: "doktor", address: "", phone: "", companyEmail: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const { token } = await registerCompany({
        company: {
          name: values.companyName.trim(),
          type: values.type,
          address: emptyToUndefined(values.address),
          phone: emptyToUndefined(values.phone),
          email: emptyToUndefined(values.companyEmail),
        },
        user: { email: values.email, password: values.password },
      });
      signIn(token);
      router.replace("/dashboard");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError("email", { message: "Korisnik sa ovim email-om već postoji" });
      } else if (e instanceof ApiError && e.status === 429) {
        setFormError("Previše pokušaja. Pokušaj ponovo za 15 minuta.");
      } else {
        setFormError(e instanceof ApiError ? e.message : "Došlo je do greške");
      }
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">Registracija firme</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Naziv firme" htmlFor="companyName" error={errors.companyName?.message}>
          <Input id="companyName" aria-invalid={!!errors.companyName} {...register("companyName")} />
        </Field>
        <Field label="Tip firme" htmlFor="type" error={errors.type?.message}>
          <Select id="type" {...register("type")}>
            <option value="doktor">Stomatološka ordinacija (doktor)</option>
            <option value="proteticar">Zubotehnička laboratorija (protetičar)</option>
          </Select>
        </Field>
        <Field label="Adresa (opciono)" htmlFor="address">
          <Input id="address" {...register("address")} />
        </Field>
        <Field label="Telefon (opciono)" htmlFor="phone">
          <Input id="phone" type="tel" {...register("phone")} />
        </Field>
        <Field label="Kontakt email firme (opciono)" htmlFor="companyEmail" error={errors.companyEmail?.message}>
          <Input id="companyEmail" type="email" aria-invalid={!!errors.companyEmail} {...register("companyEmail")} />
        </Field>

        <hr className="border-primary/15" />

        <Field label="Email za prijavu" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Lozinka" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
