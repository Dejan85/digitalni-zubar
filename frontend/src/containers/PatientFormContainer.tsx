"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PatientForm } from "@/components/patients/PatientForm";
import { ApiError } from "@/lib/api";
import { createPatient, updatePatient } from "@/lib/endpoints";
import { toDateInput } from "@/lib/format";
import type { Patient } from "@/lib/types";

const patientSchema = z.object({
  firstName: z.string().trim().min(1, "Ime je obavezno"),
  lastName: z.string().trim().min(1, "Prezime je obavezno"),
  birthDate: z.string().min(1, "Datum rođenja je obavezan"),
  gender: z.enum(["M", "Z"]),
});
type PatientValues = z.infer<typeof patientSchema>;

interface PatientFormContainerProps {
  patient?: Patient; // bez njega = kreiranje
  onDone: () => void;
}

export function PatientFormContainer({ patient, onDone }: PatientFormContainerProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? { firstName: patient.firstName, lastName: patient.lastName, birthDate: toDateInput(patient.birthDate), gender: patient.gender }
      : { firstName: "", lastName: "", birthDate: "", gender: "M" },
  });

  const mutation = useMutation({
    mutationFn: (values: PatientValues) => (patient ? updatePatient(patient.id, values) : createPatient(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });

  async function onSubmit(values: PatientValues) {
    setFormError(null);
    try {
      await mutation.mutateAsync(values);
      onDone();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Došlo je do greške");
    }
  }

  return (
    <PatientForm
      fields={{
        firstName: register("firstName"),
        lastName: register("lastName"),
        birthDate: register("birthDate"),
        gender: register("gender"),
      }}
      errors={errors}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel={patient ? "Sačuvaj" : "Dodaj pacijenta"}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={onDone}
    />
  );
}
