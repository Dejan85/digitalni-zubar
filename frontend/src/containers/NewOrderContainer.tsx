"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { NewOrderForm, type NewOrderValues } from "@/components/orders/NewOrderForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { createOrder, listConnections, listPatients, listServices, searchCompanies } from "@/lib/endpoints";
import { formatPrice } from "@/lib/format";

const parseNumber = (value: string) => Number(value.trim().replace(",", "."));

const itemSchema = z
  .object({
    mode: z.enum(["catalog", "free"]),
    serviceId: z.string(),
    freeDescription: z.string(),
    quantity: z.string(),
    price: z.string(),
  })
  .superRefine((item, ctx) => {
    const quantity = parseNumber(item.quantity);
    if (!item.quantity.trim() || !Number.isInteger(quantity) || quantity < 1) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "Količina mora biti ceo broj, najmanje 1" });
    }
    if (item.mode === "catalog" && !item.serviceId) {
      ctx.addIssue({ code: "custom", path: ["serviceId"], message: "Izaberi uslugu" });
    }
    if (item.mode === "free") {
      if (!item.freeDescription.trim()) {
        ctx.addIssue({ code: "custom", path: ["freeDescription"], message: "Opis je obavezan" });
      }
      const price = parseNumber(item.price);
      if (!item.price.trim() || Number.isNaN(price) || price < 0) {
        ctx.addIssue({ code: "custom", path: ["price"], message: "Unesi cenu (0 ili više)" });
      }
    }
  });

const orderSchema = z.object({
  technicianId: z.string().min(1, "Izaberi laboratoriju"),
  patientId: z.string().min(1, "Izaberi pacijenta"),
  items: z.array(itemSchema).min(1, "Porudžbina mora imati bar jednu stavku"),
});

const EMPTY_ITEM: NewOrderValues["items"][number] = {
  mode: "catalog",
  serviceId: "",
  freeDescription: "",
  quantity: "1",
  price: "",
};

export function NewOrderContainer() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = session?.isSuperAdmin === true;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NewOrderValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { technicianId: "", patientId: "", items: [{ ...EMPTY_ITEM }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const technicianId = useWatch({ control, name: "technicianId" });
  const items = useWatch({ control, name: "items" });

  // laboratorije: aktivne veze (super admin: sve laboratorije)
  const connectionsQuery = useQuery({ queryKey: ["connections"], queryFn: () => listConnections() });
  const techniciansQuery = useQuery({
    queryKey: ["companies", { type: "proteticar" }],
    queryFn: () => searchCompanies({ type: "proteticar" }),
  });
  const patientsQuery = useQuery({ queryKey: ["patients", { q: "" }], queryFn: () => listPatients() });
  const servicesQuery = useQuery({
    queryKey: ["services", { technicianId }],
    queryFn: () => listServices(technicianId),
    enabled: !!technicianId,
  });

  // usluge pripadaju laboratoriji: pri promeni laboratorije izbor usluga se poništava
  const previousTechnician = useRef(technicianId);
  useEffect(() => {
    if (previousTechnician.current === technicianId) return;
    previousTechnician.current = technicianId;
    getValues("items").forEach((_, i) => setValue(`items.${i}.serviceId`, ""));
  }, [technicianId, getValues, setValue]);

  const technicianNames = new Map((techniciansQuery.data?.companies ?? []).map((c) => [c.id, c.name]));
  const activeIds = new Set(
    (connectionsQuery.data?.connections ?? []).filter((c) => c.status === "prihvaceno").map((c) => c.technicianId),
  );
  const technicianIds = isAdmin ? [...technicianNames.keys()] : [...activeIds];
  const technicianOptions = technicianIds.map((id) => ({ value: id, label: technicianNames.get(id) ?? "…" }));
  const patientOptions = (patientsQuery.data?.patients ?? []).map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));
  const services = servicesQuery.data?.services ?? [];
  const serviceOptions = services.map((s) => ({ value: s.id, label: `${s.name} — ${formatPrice(s.price)}` }));

  const lineAmount = (item: NewOrderValues["items"][number] | undefined): number | null => {
    if (!item) return null;
    const quantity = parseNumber(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return null;
    const unit =
      item.mode === "catalog"
        ? Number(services.find((s) => s.id === item.serviceId)?.price ?? NaN)
        : item.price.trim()
          ? parseNumber(item.price)
          : NaN;
    return Number.isNaN(unit) ? null : unit * quantity;
  };
  const amounts = fields.map((_, i) => lineAmount(items?.[i]));
  const total = amounts.reduce<number>((sum, a) => sum + (a ?? 0), 0);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  async function onSubmit(values: NewOrderValues) {
    setFormError(null);
    try {
      const { order } = await mutation.mutateAsync({
        technicianId: values.technicianId,
        patientId: values.patientId,
        items: values.items.map((item) =>
          item.mode === "catalog"
            ? { serviceId: item.serviceId, quantity: parseNumber(item.quantity) }
            : {
                freeDescription: item.freeDescription.trim(),
                quantity: parseNumber(item.quantity),
                price: parseNumber(item.price),
              },
        ),
      });
      router.push(`/orders/${order.id}`);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Došlo je do greške");
    }
  }

  if (connectionsQuery.isPending || techniciansQuery.isPending || patientsQuery.isPending) return <p className="text-muted">Učitavanje...</p>;

  return (
    <NewOrderForm
      register={register}
      errors={errors}
      technicianOptions={technicianOptions}
      patientOptions={patientOptions}
      serviceOptions={serviceOptions}
      hasTechnician={!!technicianId}
      itemModes={fields.map((_, i) => items?.[i]?.mode ?? "catalog")}
      itemLineTotals={amounts.map((a) => (a === null ? "" : formatPrice(a)))}
      total={formatPrice(total)}
      itemsCount={fields.length}
      onAddItem={() => append({ ...EMPTY_ITEM })}
      onRemoveItem={remove}
      formError={formError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
