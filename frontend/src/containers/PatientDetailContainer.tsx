"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AddNoteModal } from "@/components/patients/AddNoteModal";
import { PatientDetail } from "@/components/patients/PatientDetail";
import { PatientDrawer } from "@/components/patients/PatientDrawer";
import { useAuth } from "@/lib/auth";
import { createNote, getMyCompany, getPatient, listNotes, listOrders } from "@/lib/endpoints";
import { initials } from "@/lib/orders-list";
import { buildPatientDetail } from "@/lib/patient-detail";

import { PatientFormContainer } from "./PatientFormContainer";

const FETCH_LIMIT = 100; // maksimum koji backend vraća po stranici; nalozi pacijenta se filtriraju iz ovog uzorka

const noteSchema = z.object({ text: z.string().trim().min(1, "Unesi tekst beleške") });
type NoteValues = z.infer<typeof noteSchema>;

export function PatientDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const patientQuery = useQuery({ queryKey: ["patients", id], queryFn: () => getPatient(id) });
  // isti query ključ kao kontrolna tabla, lista porudžbina i lista pacijenata — jedan zahtev za sve
  const ordersQuery = useQuery({
    queryKey: ["orders", "dashboard"],
    queryFn: () => listOrders({ pageSize: FETCH_LIMIT }),
    enabled: !!session,
  });
  const notesQuery = useQuery({ queryKey: ["notes", { patientId: id }], queryFn: () => listNotes({ patientId: id }) });
  const companyQuery = useQuery({ queryKey: ["company", "me"], queryFn: getMyCompany, enabled: !!session });

  const { register, handleSubmit, reset, formState } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: "" },
  });

  const addNote = useMutation({
    mutationFn: (values: NoteValues) => createNote({ patientId: id, text: values.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      reset();
      setIsNoteOpen(false);
    },
  });

  const patient = patientQuery.data?.patient;
  const orders = ordersQuery.data?.orders;
  const data = useMemo(
    () => (patient ? buildPatientDetail(patient, (orders ?? []).filter((o) => o.patientId === patient.id)) : undefined),
    [patient, orders],
  );
  const doctorName = companyQuery.data?.company.name ?? "—";

  return (
    <PatientDetail
      data={data}
      notes={(notesQuery.data?.notes ?? []).map((n) => ({ id: n.id, text: n.text }))}
      doctorName={doctorName}
      doctorInitials={initials(doctorName) || "—"}
      newOrderHref={`/orders/new?patientId=${id}`}
      orderHref={(orderId) => `/orders/${orderId}`}
      onEdit={() => setIsEditing(true)}
      onAddNote={() => {
        addNote.reset();
        setIsNoteOpen(true);
      }}
      isLoading={patientQuery.isPending}
      errorMessage={patientQuery.error?.message}
    >
      {isEditing && patient && (
        <PatientDrawer
          title="Izmena pacijenta"
          subtitle="Izmena podataka stomatološkog kartona"
          icon="edit"
          onClose={() => setIsEditing(false)}
        >
          <PatientFormContainer patient={patient} doctorName={companyQuery.data?.company.name} onDone={() => setIsEditing(false)} />
        </PatientDrawer>
      )}
      {isNoteOpen && (
        <AddNoteModal
          noteField={register("text")}
          errorMessage={formState.errors.text?.message ?? addNote.error?.message}
          isSubmitting={addNote.isPending}
          onSubmit={handleSubmit((values) => addNote.mutate(values))}
          onClose={() => setIsNoteOpen(false)}
        />
      )}
    </PatientDetail>
  );
}
