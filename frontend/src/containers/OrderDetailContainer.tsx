"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { OrderDetail, type StatusAction } from "@/components/orders/OrderDetail";
import { useAuth } from "@/lib/auth";
import { createNote, getOrder, listNotes, listServices, updateOrderStatus } from "@/lib/endpoints";
import { formatDate, formatPrice } from "@/lib/format";
import {
  allowedTransitions,
  ORDER_STATUS_ACTIONS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
} from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

const noteSchema = z.object({ text: z.string().trim().min(1, "Unesi tekst beleške") });
type NoteValues = z.infer<typeof noteSchema>;

const DESTRUCTIVE: OrderStatus[] = ["otkazana", "odbijena", "vracena_na_doradu"];

export function OrderDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [deadline, setDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState<string>();

  const orderQuery = useQuery({ queryKey: ["orders", id], queryFn: () => getOrder(id) });
  const order = orderQuery.data?.order;

  // stavke iz kataloga nose samo serviceId — imena uzimamo iz kataloga protetičara
  const servicesQuery = useQuery({
    queryKey: ["services", { technicianId: order?.technicianId }],
    queryFn: () => listServices(order?.technicianId),
    enabled: !!order,
  });
  const notesQuery = useQuery({ queryKey: ["notes", { orderId: id }], queryFn: () => listNotes({ orderId: id }) });

  const { register, handleSubmit, reset, formState } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: "" },
  });

  const addNote = useMutation({
    mutationFn: (values: NoteValues) => createNote({ orderId: id, text: values.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      reset();
    },
  });

  const changeStatus = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status, status === "potvrdjena" ? deadline : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setDeadline("");
    },
    // npr. 409: druga strana je u međuvremenu promenila status, pa prikaz mora da se osveži
    onError: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const serviceNames = new Map(servicesQuery.data?.services.map((s) => [s.id, s.name]));
  // super admin sme bilo koji status (backend ga ne ogranicava redosledom ni tipom firme)
  const transitions =
    order && session
      ? session.isSuperAdmin
        ? ORDER_STATUSES.filter((s) => s !== "primljena" && s !== order.status)
        : allowedTransitions(order.status, session.type)
      : [];
  const actions: StatusAction[] = transitions.map((status) => ({
    status,
    label: ORDER_STATUS_ACTIONS[status],
    isDestructive: DESTRUCTIVE.includes(status),
  }));

  const handleAction = (status: string) => {
    if (status === "potvrdjena" && !deadline) {
      setDeadlineError("Unesi rok isporuke pre potvrde");
      return;
    }
    setDeadlineError(undefined);
    changeStatus.mutate(status as OrderStatus);
  };

  const total = order?.items.reduce((sum, item) => sum + Number(item.priceAtOrder) * item.quantity, 0) ?? 0;

  return (
    <OrderDetail
      patientName={order && `${order.patientFirstName ?? ""} ${order.patientLastName ?? ""}`.trim()}
      statusLabel={order && ORDER_STATUS_LABELS[order.status]}
      statusTone={order && ORDER_STATUS_TONES[order.status]}
      doctorName={order?.doctorName}
      technicianName={order?.technicianName}
      deadline={order && formatDate(order.deliveryDeadline)}
      createdAt={order && formatDate(order.createdAt)}
      items={(order?.items ?? []).map((item) => ({
        id: item.id,
        description:
          item.freeDescription ?? (item.serviceId && serviceNames.get(item.serviceId)) ?? "Usluga iz kataloga",
        quantity: item.quantity,
        unitPrice: formatPrice(item.priceAtOrder),
        lineTotal: formatPrice(Number(item.priceAtOrder) * item.quantity),
      }))}
      total={formatPrice(total)}
      impressions={(order?.impressions ?? []).map((i) => ({
        id: i.id,
        typeLabel: i.type === "digitalni" ? "Digitalni otisak" : "Analogni otisak",
        detail: [i.filePath?.split(/[\\/]/).pop(), i.note].filter(Boolean).join(" — ") || "—",
      }))}
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
      actions={actions}
      needsDeadline={transitions.includes("potvrdjena")}
      deadlineValue={deadline}
      onDeadlineChange={setDeadline}
      actionError={deadlineError ?? changeStatus.error?.message}
      isUpdatingStatus={changeStatus.isPending}
      onAction={handleAction}
      isLoading={orderQuery.isPending}
      errorMessage={orderQuery.error?.message}
    />
  );
}
