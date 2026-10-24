"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog";
import { PatientDrawer } from "@/components/patients/PatientDrawer";
import { PatientsList } from "@/components/patients/PatientsList";
import { useAuth } from "@/lib/auth";
import { deletePatient, getMyCompany, listOrders, listPatients } from "@/lib/endpoints";
import {
  buildPatientsList,
  EMPTY_PATIENT_FILTERS,
  hasActivePatientFilters,
  patientsToCsv,
  type PatientsFilters,
} from "@/lib/patients-list";
import type { Patient } from "@/lib/types";

import { PatientFormContainer } from "./PatientFormContainer";

const FETCH_LIMIT = 100; // maksimum koji backend vraća po stranici; nalozi pacijenata se računaju nad ovim uzorkom
const PAGE_SIZE = 10;

function downloadCsv(content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `pacijenti-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function PatientsContainer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PatientsFilters>(EMPTY_PATIENT_FILTERS);
  const [page, setPage] = useState(1);
  // "new" = kreiranje, Patient = izmena, null = drawer zatvoren
  const [formTarget, setFormTarget] = useState<Patient | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const patientsQuery = useQuery({ queryKey: ["patients", { q: "" }], queryFn: () => listPatients() });
  // isti query ključ kao kontrolna tabla, lista porudžbina i shell — jedan zahtev za sve
  const ordersQuery = useQuery({
    queryKey: ["orders", "dashboard"],
    queryFn: () => listOrders({ pageSize: FETCH_LIMIT }),
    enabled: !!session,
  });
  const companyQuery = useQuery({ queryKey: ["company", "me"], queryFn: getMyCompany, enabled: !!session });

  const removal = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteTarget(null);
    },
  });

  const patients = useMemo(() => patientsQuery.data?.patients ?? [], [patientsQuery.data]);
  const orders = ordersQuery.data?.orders ?? [];
  const list = useMemo(
    () => buildPatientsList(patients, ordersQuery.data?.orders ?? [], filters),
    [patients, ordersQuery.data, filters],
  );

  const totalRows = list.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const findPatient = (id: string) => patients.find((p) => p.id === id) ?? null;

  // svaka promena filtera vraća na prvu stranu
  const updateFilters = (patch: Partial<PatientsFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const closeForm = () => setFormTarget(null);

  return (
    <PatientsList
      rows={list.rows.slice(start, start + PAGE_SIZE)}
      kpis={list.kpis}
      search={filters.search}
      onSearchChange={(search) => updateFilters({ search })}
      gender={filters.gender}
      onGenderChange={(gender) => updateFilters({ gender })}
      prosthetics={filters.prosthetics}
      onProstheticsChange={(prosthetics) => updateFilters({ prosthetics })}
      ageGroup={filters.ageGroup}
      onAgeGroupChange={(ageGroup) => updateFilters({ ageGroup })}
      hasFilters={hasActivePatientFilters(filters)}
      onResetFilters={() => updateFilters(EMPTY_PATIENT_FILTERS)}
      onExportCsv={() => downloadCsv(patientsToCsv(list.rows))}
      onCreate={() => setFormTarget("new")}
      onEdit={(id) => setFormTarget(findPatient(id))}
      onDelete={(id) => {
        removal.reset();
        setDeleteTarget(findPatient(id));
      }}
      newOrderHref={(patientId) => `/orders/new?patientId=${patientId}`}
      isPartial={orders.length >= FETCH_LIMIT}
      totalRows={totalRows}
      rangeFrom={totalRows === 0 ? 0 : start + 1}
      rangeTo={Math.min(start + PAGE_SIZE, totalRows)}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
      isLoading={patientsQuery.isPending}
      errorMessage={patientsQuery.error?.message}
    >
      {formTarget && (
        <PatientDrawer
          title={formTarget === "new" ? "Dodaj novog pacijenta" : "Izmena pacijenta"}
          subtitle={
            formTarget === "new" ? "Otvaranje novog stomatološkog kartona ordinacije" : "Izmena podataka stomatološkog kartona"
          }
          icon={formTarget === "new" ? "person_add" : "edit"}
          onClose={closeForm}
        >
          <PatientFormContainer
            patient={formTarget === "new" ? undefined : formTarget}
            doctorName={companyQuery.data?.company.name}
            onDone={closeForm}
          />
        </PatientDrawer>
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
