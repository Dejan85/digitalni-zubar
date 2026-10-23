"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ServiceForm } from "@/components/services/ServiceForm";
import { ApiError } from "@/lib/api";
import { createService, updateService, type ServiceInput } from "@/lib/endpoints";
import type { Service } from "@/lib/types";

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Naziv je obavezan"),
  price: z
    .string()
    .trim()
    .refine((v) => Number(v.replace(",", ".")) > 0, "Cena mora biti broj veći od 0"),
});
type ServiceValues = z.infer<typeof serviceSchema>;

interface ServiceFormContainerProps {
  service?: Service; // bez njega = kreiranje
  technicianId?: string; // samo super admin: laboratorija u čiji katalog se upisuje nova usluga
  onDone: () => void;
}

export function ServiceFormContainer({ service, technicianId, onDone }: ServiceFormContainerProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? { name: service.name, price: service.price } : { name: "", price: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ServiceInput) => (service ? updateService(service.id, values) : createService(values, technicianId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  async function onSubmit(values: ServiceValues) {
    setFormError(null);
    try {
      await mutation.mutateAsync({ name: values.name, price: Number(values.price.replace(",", ".")) });
      onDone();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Došlo je do greške");
    }
  }

  return (
    <ServiceForm
      fields={{ name: register("name"), price: register("price") }}
      errors={errors}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel={service ? "Sačuvaj" : "Dodaj uslugu"}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={onDone}
    />
  );
}
