"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ConnectionsView, type PartnerCard, type PendingRequest } from "@/components/connections/ConnectionsView";
import { useAuth } from "@/lib/auth";
import { formatReceivedAgo, MOCK_RESPONSE_TIME, mockPartnerExtras } from "@/lib/connections-mock";
import { listConnections, listOrders, listServices, respondToConnection, searchCompanies, sendConnectionRequest } from "@/lib/endpoints";
import { useDebouncedValue } from "@/lib/hooks";
import type { Company, Connection, ConnectionStatus } from "@/lib/types";

type Tab = "active" | "received" | "sent" | "find";

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  na_cekanju: "Na čekanju",
  prihvaceno: "Povezan partner",
  odbijeno: "Odbijena",
};

const MAX_TAGS = 4;
const contactOf = (c?: Company) => c?.phone || c?.email || "—";

export function ConnectionsContainer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());

  // suprotni tip firme: doktor traži laboratorije, laboratorija ordinacije
  // super admin vidi veze svih firmi, pa mu trebaju imena obe strane i nema "primljenih"/"poslatih"
  const isAdmin = session?.isSuperAdmin === true;
  const isDoctor = session?.type === "doktor";
  const counterpartType = isAdmin ? undefined : isDoctor ? "proteticar" : "doktor";
  const myCompanyId = session?.companyId;

  // veze nose samo id-jeve, pa imena spajamo iz liste firme suprotnog tipa
  const connectionsQuery = useQuery({ queryKey: ["connections"], queryFn: () => listConnections() });
  const companiesQuery = useQuery({
    queryKey: ["companies", { type: counterpartType }],
    queryFn: () => searchCompanies({ type: counterpartType }),
    enabled: !!session,
  });
  const searchQuery = useQuery({
    queryKey: ["companies", { type: counterpartType, name: debouncedSearch }],
    queryFn: () => searchCompanies({ type: counterpartType, name: debouncedSearch || undefined }),
    enabled: !!session && tab === "find",
  });
  // nazivi usluga laboratorije (oznake na kartici) i broj zajedničkih radova — samo za ne-admina
  const servicesQuery = useQuery({ queryKey: ["services", { technicianId: "" }], queryFn: () => listServices(), enabled: !!session && isDoctor });
  const ordersQuery = useQuery({ queryKey: ["orders", { page: 1, pageSize: 100 }], queryFn: () => listOrders({ pageSize: 100 }), enabled: !!session && !isAdmin });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["connections"] });
  const respond = useMutation({
    mutationFn: (v: { id: string; status: "prihvaceno" | "odbijeno" }) => respondToConnection(v.id, v.status),
    onSuccess: invalidate,
  });
  const send = useMutation({ mutationFn: sendConnectionRequest, onSuccess: invalidate });

  const companiesById = useMemo(() => new Map((companiesQuery.data?.companies ?? []).map((c) => [c.id, c])), [companiesQuery.data]);
  const connections = useMemo(() => connectionsQuery.data?.connections ?? [], [connectionsQuery.data]);
  const counterpartId = (c: Connection) => (isDoctor ? c.technicianId : c.doctorId);
  const isReceived = (c: Connection) => !isAdmin && c.senderId !== myCompanyId;
  const nameOf = (id: string) => companiesById.get(id)?.name ?? "…";

  const tagsByTechnician = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const service of servicesQuery.data?.services ?? []) {
      map.set(service.technicianId, [...(map.get(service.technicianId) ?? []), service.name]);
    }
    return map;
  }, [servicesQuery.data]);
  const worksByCounterpart = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of ordersQuery.data?.orders ?? []) {
      const id = isDoctor ? order.technicianId : order.doctorId;
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [ordersQuery.data, isDoctor]);

  // super admin odgovara na svaki zahtev na čekanju, pa su svi "primljeni"; "poslatih" nema (odbijene veze nemaju tab u dizajnu)
  const filters: Record<Exclude<Tab, "find">, (c: Connection) => boolean> = {
    active: (c) => c.status === "prihvaceno",
    received: (c) => c.status === "na_cekanju" && (isAdmin || isReceived(c)),
    sent: (c) => c.status === "na_cekanju" && !isAdmin && !isReceived(c),
  };
  const labels = { active: "Moje veze", received: "Primljeni zahtevi", sent: "Poslati zahtevi" };
  const tabs = [
    ...(["active", "received", "sent"] as const).map((value) => ({
      value,
      label: labels[value],
      count: connections.filter(filters[value]).length,
      highlight: value === "received",
    })),
    { value: "find", label: isDoctor || isAdmin ? "Pronađi partnera (Baza laboratorija)" : "Pronađi partnera (Baza ordinacija)", count: null },
  ];

  // MOCK polja kartice (dizajn ih ima, backend ne); broj radova je stvaran kad postoji
  const cardMock = (id: string, mock: ReturnType<typeof mockPartnerExtras>) => ({
    distance: mock.distance,
    worksCount: worksByCounterpart.get(id) || mock.mockWorks,
    rating: mock.rating,
    badge: mock.badge,
    express: mock.express,
    imageUrl: mock.imageUrl,
    imageAlt: mock.imageAlt,
    contactPerson: mock.contactPerson,
    contract: mock.contract,
    punctuality: mock.punctuality,
  });

  const toCard = (c: Connection): PartnerCard => {
    const id = counterpartId(c);
    const company = companiesById.get(id);
    const mock = mockPartnerExtras(id);
    const tags = (tagsByTechnician.get(id) ?? []).slice(0, MAX_TAGS);
    return {
      id: c.id,
      name: isAdmin ? `${nameOf(c.doctorId)} ↔ ${nameOf(c.technicianId)}` : nameOf(id),
      typeLabel: isAdmin ? "Veza" : isDoctor ? mock.labTypeLabel : "Stomatološka ordinacija",
      address: isAdmin ? "—" : company?.address || "—",
      contact: isAdmin ? "—" : contactOf(company),
      tags: tags.length > 0 ? tags : mock.tags,
      ...cardMock(id, mock),
      statusLabel: STATUS_LABELS[c.status],
      action:
        c.status === "prihvaceno" && !isAdmin && isDoctor
          ? { kind: "order", companyId: id }
          : c.status === "na_cekanju"
            ? { kind: "respond", canRespond: isAdmin || isReceived(c) }
            : { kind: "status" },
    };
  };

  const connectedIds = new Map(connections.map((c) => [counterpartId(c), c]));
  const toSearchCard = (company: Company): PartnerCard => {
    const existing = connectedIds.get(company.id);
    return {
      id: company.id,
      name: company.name,
      typeLabel: company.type === "doktor" ? "Stomatološka ordinacija" : mockPartnerExtras(company.id).labTypeLabel,
      address: company.address || "—",
      contact: contactOf(company),
      tags: (tagsByTechnician.get(company.id) ?? []).slice(0, MAX_TAGS).length
        ? (tagsByTechnician.get(company.id) ?? []).slice(0, MAX_TAGS)
        : mockPartnerExtras(company.id).tags,
      ...cardMock(company.id, mockPartnerExtras(company.id)),
      statusLabel: "Nepovezan partner",
      action: { kind: "send", disabledReason: existing ? `Veza postoji (${STATUS_LABELS[existing.status].toLowerCase()})` : null },
    };
  };

  const needle = search.trim().toLowerCase();
  const cards: PartnerCard[] =
    tab === "find"
      ? (searchQuery.data?.companies ?? []).map(toSearchCard)
      : connections
          .filter(filters[tab])
          .map(toCard)
          .filter((card) => !needle || card.name.toLowerCase().includes(needle) || card.tags.some((t) => t.toLowerCase().includes(needle)));

  const receivedRequests = connections.filter(filters.received);
  const pendingRequests: PendingRequest[] = receivedRequests.map((c) => {
    const company = companiesById.get(counterpartId(c));
    return {
      id: c.id,
      name: isAdmin ? `${nameOf(c.doctorId)} ↔ ${nameOf(c.technicianId)}` : nameOf(counterpartId(c)),
      address: isAdmin ? "—" : company?.address || "—",
      phone: isAdmin ? "—" : contactOf(company),
      receivedAgo: formatReceivedAgo(c.createdAt),
      contactPerson: mockPartnerExtras(counterpartId(c)).contactPerson,
      quote: mockPartnerExtras(counterpartId(c)).requestQuote,
      icon: mockPartnerExtras(counterpartId(c)).requestIcon,
    };
  });

  // KPI: iz pravih veza; prosečan odziv je MOCK (domen ne meri odziv na digitalni nalog)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const accepted = connections.filter((c) => c.status === "prihvaceno");
  const recommended = (companiesQuery.data?.companies ?? []).filter((company) => !connectedIds.has(company.id)).length;

  return (
    <ConnectionsView
      kpis={{
        active: accepted.length,
        newThisMonth: accepted.filter((c) => new Date(c.updatedAt) >= monthStart).length,
        pending: connections.filter((c) => c.status === "na_cekanju").length,
        received: connections.filter((c) => c.status === "na_cekanju" && (isAdmin || isReceived(c))).length,
        sent: connections.filter((c) => c.status === "na_cekanju" && !isAdmin && !isReceived(c)).length,
        responseTime: MOCK_RESPONSE_TIME,
        recommended,
      }}
      counterpartLabel={isDoctor ? "laboratoriju" : "ordinaciju"}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as Tab)}
      search={search}
      onSearchChange={setSearch}
      cards={cards}
      pendingRequests={pendingRequests}
      showPending
      onRespond={(id, status) => respond.mutate({ id, status })}
      respondingId={respond.isPending ? (respond.variables?.id ?? null) : null}
      onSendRequest={(companyId) => send.mutate(companyId)}
      sendingId={send.isPending ? (send.variables ?? null) : null}
      isLoading={tab === "find" ? searchQuery.isPending : connectionsQuery.isPending}
      errorMessage={(connectionsQuery.error ?? respond.error ?? send.error)?.message}
    />
  );
}
