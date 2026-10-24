"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { OrderDetail, OrderDetailMessage, type StatusAction } from "@/components/orders/OrderDetail";
import { useAuth } from "@/lib/auth";
import { createNote, getOrder, listNotes, listServices, updateOrderStatus, uploadImpression } from "@/lib/endpoints";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { formatFileSize, validateImpressionFile } from "@/lib/impressions";
import { initials, deadlineInfo } from "@/lib/orders-list";
import { mockItemExtras, mockOrderDetailExtras, mockOrderExtras } from "@/lib/orders-mock";
import { buildTimeline } from "@/lib/order-timeline";
import {
  allowedTransitions,
  ORDER_STATUS_ACTIONS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  REWORK_REASONS,
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

  const [impressionType, setImpressionType] = useState<"digitalni" | "analogni">("digitalni");
  const [impressionFile, setImpressionFile] = useState<File | null>(null);
  const [impressionNote, setImpressionNote] = useState("");
  const [impressionError, setImpressionError] = useState<string>();

  const [reworkReason, setReworkReason] = useState("");
  const [reworkDescription, setReworkDescription] = useState("");
  const [reworkError, setReworkError] = useState<string>();

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

  const addImpression = useMutation({
    mutationFn: () =>
      uploadImpression(id, {
        type: impressionType,
        note: impressionNote.trim() || undefined,
        file: impressionType === "digitalni" ? (impressionFile ?? undefined) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setImpressionFile(null);
      setImpressionNote("");
      setImpressionError(undefined);
    },
  });

  const handleImpressionFile = (file: File | null) => {
    setImpressionFile(file);
    setImpressionError(file ? validateImpressionFile(file) : undefined);
  };

  const handleImpressionSubmit = () => {
    if (impressionType === "digitalni" && !impressionFile) {
      setImpressionError("Izaberi fajl za digitalni otisak");
      return;
    }
    if (impressionType === "analogni" && !impressionNote.trim()) {
      setImpressionError("Napomena je obavezna za analogni otisak");
      return;
    }
    const fileError =
      impressionType === "digitalni" && impressionFile ? validateImpressionFile(impressionFile) : undefined;
    if (fileError) {
      setImpressionError(fileError);
      return;
    }
    setImpressionError(undefined);
    addImpression.mutate();
  };

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

  // dorada: razlog i opis se čuvaju kao ručna beleška (backend nema polje "razlog"), pa sledi promena statusa
  const submitRework = useMutation({
    mutationFn: async () => {
      const reason = REWORK_REASONS.find((r) => r.value === reworkReason)?.label ?? reworkReason;
      const description = reworkDescription.trim();
      await createNote({ orderId: id, text: `Dorada: ${reason}${description ? ` — ${description}` : ""}` });
      await updateOrderStatus(id, "vracena_na_doradu");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setReworkReason("");
      setReworkDescription("");
      setReworkError(undefined);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const handleReworkSubmit = () => {
    if (!reworkReason) {
      setReworkError("Izaberi razlog dorade");
      return;
    }
    setReworkError(undefined);
    submitRework.mutate();
  };

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

  if (orderQuery.isPending) return <OrderDetailMessage message="Učitavanje..." />;
  if (!order) return <OrderDetailMessage message={orderQuery.error?.message ?? "Porudžbina nije pronađena"} isError />;

  const canRework = transitions.includes("vracena_na_doradu");
  const total = order.items.reduce((sum, item) => sum + Number(item.priceAtOrder) * item.quantity, 0);

  const patientName = `${order.patientFirstName ?? ""} ${order.patientLastName ?? ""}`.trim() || "—";
  const doctorName = order.doctorName ?? "—";
  const technicianName = order.technicianName ?? "—";
  const detailMock = mockOrderDetailExtras(order, initials(patientName));
  const labMock = mockOrderExtras(order, technicianName);
  const deadlineText = deadlineInfo(order, new Date());
  const timeline = buildTimeline({
    status: order.status,
    doctorName,
    technicianName,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deadline: deadlineText.deadline,
  });
  const items = order.items.map((item, index) => ({
    id: item.id,
    description: item.freeDescription ?? (item.serviceId && serviceNames.get(item.serviceId)) ?? "Usluga iz kataloga",
    ...mockItemExtras(item.id, index),
    quantity: item.quantity,
    unitPrice: formatPrice(item.priceAtOrder),
    lineTotal: formatPrice(Number(item.priceAtOrder) * item.quantity),
  }));
  const fdiList = [...new Set(items.flatMap((item) => item.fdi.split(",").map((t) => t.trim())))];

  return (
    <OrderDetail
      shortId={shortId(order.id)}
      patient={{
        name: patientName,
        recordNumber: detailMock.recordNumber,
        ageText: detailMock.ageText,
        birthDate: detailMock.birthDate,
        genderLabel: detailMock.genderLabel,
        jmbg: detailMock.jmbg,
        allergies: detailMock.allergies,
      }}
      statusLabel={ORDER_STATUS_LABELS[order.status]}
      statusTone={ORDER_STATUS_TONES[order.status]}
      isUrgent={deadlineText.isUrgent}
      deadline={deadlineText.deadline}
      deadlineHint={deadlineText.deadlineHint}
      createdAt={formatDate(order.createdAt)}
      fdiList={fdiList}
      courier={detailMock.courier}
      clinic={{
        name: doctorName,
        address: detailMock.doctorAddress,
        contactName: `${doctorName} (${detailMock.doctorTitle})`,
        phone: detailMock.doctorPhone,
        license: detailMock.license,
      }}
      lab={{
        name: technicianName,
        address: detailMock.labAddress,
        contactName: detailMock.assignedTechnician,
        phone: detailMock.labPhone,
        isVerified: labMock.partnerVerified,
      }}
      items={items}
      total={formatPrice(total)}
      impressions={order.impressions.map((i) => ({
        id: i.id,
        isDigital: i.type === "digitalni",
        typeLabel: i.type === "digitalni" ? "Digitalni otisak" : "Analogni otisak",
        detail: [i.filePath?.split(/[\/]/).pop(), i.note].filter(Boolean).join(" — ") || "—",
      }))}
      impressionUpload={{
        type: impressionType,
        onTypeChange: (type) => {
          setImpressionType(type);
          setImpressionError(undefined);
        },
        file: impressionFile && { name: impressionFile.name, size: formatFileSize(impressionFile.size) },
        onFileSelect: handleImpressionFile,
        note: impressionNote,
        onNoteChange: setImpressionNote,
        error: impressionError ?? addImpression.error?.message,
        isUploading: addImpression.isPending,
        onSubmit: (event) => {
          event.preventDefault();
          handleImpressionSubmit();
        },
      }}
      timeline={timeline}
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
      actionError={deadlineError ?? changeStatus.error?.message ?? submitRework.error?.message}
      isUpdatingStatus={changeStatus.isPending || submitRework.isPending}
      onAction={handleAction}
      rework={{
        isAvailable: canRework,
        reasons: REWORK_REASONS,
        reason: reworkReason,
        onReasonChange: setReworkReason,
        description: reworkDescription,
        onDescriptionChange: setReworkDescription,
        error: reworkError,
        onSubmit: handleReworkSubmit,
      }}
    />
  );
}
