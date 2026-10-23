"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PatientDetail } from "@/components/patients/PatientDetail";
import { createNote, getPatient, listNotes } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";

const noteSchema = z.object({ text: z.string().trim().min(1, "Unesi tekst beleške") });
type NoteValues = z.infer<typeof noteSchema>;

export function PatientDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const patientQuery = useQuery({ queryKey: ["patients", id], queryFn: () => getPatient(id) });
  const notesQuery = useQuery({ queryKey: ["notes", { patientId: id }], queryFn: () => listNotes({ patientId: id }) });

  const { register, handleSubmit, reset, formState } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: "" },
  });

  const addNote = useMutation({
    mutationFn: (values: NoteValues) => createNote({ patientId: id, text: values.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      reset();
    },
  });

  const patient = patientQuery.data?.patient;

  return (
    <PatientDetail
      fullName={patient && `${patient.firstName} ${patient.lastName}`}
      birthDate={patient && formatDate(patient.birthDate)}
      genderLabel={patient && (patient.gender === "M" ? "Muški" : "Ženski")}
      notes={(notesQuery.data?.notes ?? []).map((n) => ({
        id: n.id,
        text: n.text,
        date: formatDate(n.date),
        isAutomatic: n.type === "automatska",
      }))}
      noteField={register("text")}
      noteError={formState.errors.text?.message ?? addNote.error?.message}
      isAddingNote={addNote.isPending}
      onAddNote={handleSubmit((values) => addNote.mutate(values))}
      isLoading={patientQuery.isPending}
      errorMessage={patientQuery.error?.message}
    />
  );
}
