"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { register as registerCompany } from "@/lib/endpoints";
import { getPasswordStrength } from "@/lib/password-strength";

const registerSchema = z
  .object({
    companyName: z.string().trim().min(1, "Naziv je obavezan"),
    type: z.enum(["doktor", "proteticar"]),
    phone: z.string().trim().min(1, "Telefon je obavezan"),
    email: z.email("Email nije validan"),
    password: z.string().min(8, "Lozinka mora imati bar 8 karaktera"),
    passwordConfirm: z.string(),
    termsAccepted: z.boolean().refine((v) => v, "Morate prihvatiti uslove korišćenja"),
    privacyAccepted: z.boolean().refine((v) => v, "Morate dati saglasnost za obradu podataka"),
  })
  .refine((v) => v.password === v.passwordConfirm, { path: ["passwordConfirm"], message: "Lozinke se ne poklapaju" });
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterContainer() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { type: "doktor", termsAccepted: false, privacyAccepted: false },
  });

  const accountType = useWatch({ control, name: "type" });
  const password = useWatch({ control, name: "password" });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const { token } = await registerCompany({
        company: { name: values.companyName.trim(), type: values.type, phone: values.phone.trim() },
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
    <RegisterForm
      fields={{
        companyName: register("companyName"),
        type: register("type"),
        phone: register("phone"),
        email: register("email"),
        password: register("password"),
        passwordConfirm: register("passwordConfirm"),
        termsAccepted: register("termsAccepted"),
        privacyAccepted: register("privacyAccepted"),
      }}
      errors={errors}
      formError={formError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      accountType={accountType}
      passwordStrength={getPasswordStrength(password ?? "")}
    />
  );
}
