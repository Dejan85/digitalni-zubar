"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { DeleteServiceDialog } from "@/components/services/DeleteServiceDialog";
import { ServiceModal } from "@/components/services/ServiceModal";
import { ServicesView } from "@/components/services/ServicesView";
import { useAuth } from "@/lib/auth";
import { deleteService, listConnections, listServices, searchCompanies } from "@/lib/endpoints";
import { buildCatalog, catalogToCsv, type CategoryFilter } from "@/lib/services-catalog";
import type { Service } from "@/lib/types";

import { ServiceFormContainer } from "./ServiceFormContainer";

const PAGE_SIZE = 8;

function downloadCsv(content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `katalog-usluga-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ServicesContainer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isDoctor = session?.type === "doktor";
  const isAdmin = session?.isSuperAdmin === true;
  const seesTechnicians = isDoctor || isAdmin; // ima filter laboratorija i imena laboratorija
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // "new" = kreiranje, Service = izmena, null = modal zatvoren
  const [formTarget, setFormTarget] = useState<Service | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services", { technicianId: technicianFilter }],
    queryFn: () => listServices(technicianFilter || undefined),
    enabled: !!session,
  });

  // veze: broj povezanih partnera (KPI) i, za doktora, nazivi/filter laboratorija
  const connectionsQuery = useQuery({ queryKey: ["connections"], queryFn: () => listConnections(), enabled: !!session });
  const techniciansQuery = useQuery({
    queryKey: ["companies", { type: "proteticar" }],
    queryFn: () => searchCompanies({ type: "proteticar" }),
    enabled: seesTechnicians,
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setDeleteTarget(null);
    },
  });

  const services = useMemo(() => servicesQuery.data?.services ?? [], [servicesQuery.data]);
  const technicianNames = useMemo(
    () => new Map((techniciansQuery.data?.companies ?? []).map((c) => [c.id, c.name])),
    [techniciansQuery.data],
  );
  const acceptedConnections = (connectionsQuery.data?.connections ?? []).filter((c) => c.status === "prihvaceno");
  const activeTechnicianIds = new Set(acceptedConnections.map((c) => c.technicianId));
  // super admin bira među svim laboratorijama, ne samo među povezanim
  const technicianIds = isAdmin ? [...technicianNames.keys()] : [...activeTechnicianIds];
  const technicianOptions = technicianIds.map((id) => ({ id, name: technicianNames.get(id) ?? "…" }));

  const catalog = useMemo(
    () => buildCatalog(services, technicianNames, { category, search }),
    [services, technicianNames, category, search],
  );
  const totalRows = catalog.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const findService = (id: string) => services.find((s) => s.id === id) ?? null;

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <ServicesView
      rows={catalog.rows.slice(start, start + PAGE_SIZE)}
      kpis={catalog.kpis}
      chips={catalog.chips}
      category={category}
      onCategoryChange={(value) => changeFilter(() => setCategory(value))}
      search={search}
      onSearchChange={(value) => changeFilter(() => setSearch(value))}
      canManage={!isDoctor || isAdmin}
      canCreate={isAdmin ? !!technicianFilter : !isDoctor}
      showTechnician={seesTechnicians}
      technicianOptions={seesTechnicians ? technicianOptions : undefined}
      technicianFilter={technicianFilter}
      onTechnicianFilterChange={(value) => changeFilter(() => setTechnicianFilter(value))}
      connectionsCount={connectionsQuery.data ? acceptedConnections.length : null}
      connectionsLabel={isDoctor ? "Povezane laboratorije" : "Povezane ordinacije"}
      onCreate={() => setFormTarget("new")}
      onEdit={(id) => setFormTarget(findService(id))}
      onDelete={(id) => {
        removal.reset();
        setDeleteTarget(findService(id));
      }}
      onExportCsv={() => downloadCsv(catalogToCsv(catalog.rows, seesTechnicians))}
      totalRows={totalRows}
      rangeFrom={totalRows === 0 ? 0 : start + 1}
      rangeTo={Math.min(start + PAGE_SIZE, totalRows)}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
      isLoading={servicesQuery.isPending}
      errorMessage={servicesQuery.error?.message}
    >
      {formTarget && (
        <ServiceModal
          title={formTarget === "new" ? "Nova usluga u katalogu" : "Izmena usluge"}
          subtitle={
            formTarget === "new"
              ? "Unesite parametre rada koje će videti sve ordinacije koje sarađuju sa laboratorijom."
              : "Izmenite naziv ili cenu usluge u katalogu laboratorije."
          }
          onClose={() => setFormTarget(null)}
        >
          <ServiceFormContainer
            service={formTarget === "new" ? undefined : formTarget}
            technicianId={isAdmin ? technicianFilter : undefined}
            onDone={() => setFormTarget(null)}
          />
        </ServiceModal>
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
