"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { DeleteServiceDialog } from "@/components/services/DeleteServiceDialog";
import { ServicesView, type ServiceRow } from "@/components/services/ServicesView";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth";
import { deleteService, listConnections, listServices, searchCompanies } from "@/lib/endpoints";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

import { ServiceFormContainer } from "./ServiceFormContainer";

export function ServicesContainer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isDoctor = session?.type === "doktor";
  const [technicianFilter, setTechnicianFilter] = useState("");
  // "new" = kreiranje, Service = izmena, null = modal zatvoren
  const [formTarget, setFormTarget] = useState<Service | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services", { technicianId: technicianFilter }],
    queryFn: () => listServices(technicianFilter || undefined),
    enabled: !!session,
  });

  // doktor: nazivi laboratorija i filter dolaze iz aktivnih veza + liste laboratorija
  const connectionsQuery = useQuery({ queryKey: ["connections"], queryFn: () => listConnections(), enabled: isDoctor });
  const techniciansQuery = useQuery({
    queryKey: ["companies", { type: "proteticar" }],
    queryFn: () => searchCompanies({ type: "proteticar" }),
    enabled: isDoctor,
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setDeleteTarget(null);
    },
  });

  const services = servicesQuery.data?.services ?? [];
  const technicianNames = new Map((techniciansQuery.data?.companies ?? []).map((c) => [c.id, c.name]));
  const activeTechnicianIds = new Set(
    (connectionsQuery.data?.connections ?? []).filter((c) => c.status === "prihvaceno").map((c) => c.technicianId),
  );
  const technicianOptions = [...activeTechnicianIds].map((id) => ({ id, name: technicianNames.get(id) ?? "…" }));

  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: formatPrice(s.price),
    technicianName: technicianNames.get(s.technicianId) ?? "…",
  }));
  const findService = (id: string) => services.find((s) => s.id === id) ?? null;

  return (
    <ServicesView
      title={isDoctor ? "Katalog usluga" : "Moje usluge"}
      rows={rows}
      canManage={!isDoctor}
      onCreate={() => setFormTarget("new")}
      onEdit={(id) => setFormTarget(findService(id))}
      onDelete={(id) => {
        removal.reset();
        setDeleteTarget(findService(id));
      }}
      technicianOptions={isDoctor ? technicianOptions : undefined}
      technicianFilter={technicianFilter}
      onTechnicianFilterChange={setTechnicianFilter}
      isLoading={servicesQuery.isPending}
      errorMessage={servicesQuery.error?.message}
    >
      {formTarget && (
        <Modal title={formTarget === "new" ? "Nova usluga" : "Izmena usluge"} onClose={() => setFormTarget(null)}>
          <ServiceFormContainer service={formTarget === "new" ? undefined : formTarget} onDone={() => setFormTarget(null)} />
        </Modal>
      )}
      {deleteTarget && (
        <DeleteServiceDialog
          serviceName={deleteTarget.name}
          isDeleting={removal.isPending}
          errorMessage={removal.error?.message}
          onConfirm={() => removal.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </ServicesView>
  );
}
