"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoginForm } from "@/components/auth/LoginForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { login } from "@/lib/endpoints";

const loginSchema = z.object({
  email: z.email("Email nije validan"),
  password: z.string().min(1, "Lozinka je obavezna"),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginContainer() {
  const { signIn } = useAuth();
  const router = useRouter();
  const notice = useSearchParams().get("message");
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
    <LoginForm
      fields={{ email: register("email"), password: register("password") }}
      errors={errors}
      formError={formError}
      notice={notice}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
