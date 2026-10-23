"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog";
import { PatientsList, type PatientRow } from "@/components/patients/PatientsList";
import { Modal } from "@/components/ui/Modal";
import { deletePatient, listPatients } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type { Patient } from "@/lib/types";

import { PatientFormContainer } from "./PatientFormContainer";

export function PatientsContainer() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  // "new" = kreiranje, Patient = izmena, null = modal zatvoren
  const [formTarget, setFormTarget] = useState<Patient | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["patients", { q: debouncedSearch }],
    queryFn: () => listPatients(debouncedSearch || undefined),
  });

  const removal = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setDeleteTarget(null);
    },
  });

  const patients = data?.patients ?? [];
  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    fullName: `${p.firstName} ${p.lastName}`,
    birthDate: formatDate(p.birthDate),
    genderLabel: p.gender === "M" ? "Muški" : "Ženski",
  }));
  const findPatient = (id: string) => patients.find((p) => p.id === id) ?? null;

  return (
    <PatientsList
      rows={rows}
      search={search}
      onSearchChange={setSearch}
      onCreate={() => setFormTarget("new")}
      onEdit={(id) => setFormTarget(findPatient(id))}
      onDelete={(id) => {
        removal.reset();
        setDeleteTarget(findPatient(id));
      }}
      isLoading={isPending}
      errorMessage={error?.message}
    >
      {formTarget && (
        <Modal title={formTarget === "new" ? "Novi pacijent" : "Izmena pacijenta"} onClose={() => setFormTarget(null)}>
          <PatientFormContainer patient={formTarget === "new" ? undefined : formTarget} onDone={() => setFormTarget(null)} />
        </Modal>
      )}
      {deleteTarget && (
        <DeletePatientDialog
          patientName={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          isDeleting={removal.isPending}
          errorMessage={removal.error?.message}
          onConfirm={() => removal.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </PatientsList>
  );
}
