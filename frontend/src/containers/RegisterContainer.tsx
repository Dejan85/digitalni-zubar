"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RegisterForm } from "@/components/auth/RegisterForm";
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

export function RegisterContainer() {
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
    <RegisterForm
      fields={{
        companyName: register("companyName"),
        type: register("type"),
        address: register("address"),
        phone: register("phone"),
        companyEmail: register("companyEmail"),
        email: register("email"),
        password: register("password"),
      }}
      errors={errors}
      formError={formError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
