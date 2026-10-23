"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ConnectionsView, type CompanyRow, type ConnectionRow } from "@/components/connections/ConnectionsView";
import { useAuth } from "@/lib/auth";
import { listConnections, respondToConnection, searchCompanies, sendConnectionRequest } from "@/lib/endpoints";
import { useDebouncedValue } from "@/lib/hooks";
import type { Company, Connection, ConnectionStatus } from "@/lib/types";
import type { StatusTone } from "@/lib/order-status";

type Tab = "active" | "received" | "sent";

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  na_cekanju: "Na čekanju",
  prihvaceno: "Aktivna",
  odbijeno: "Odbijena",
};
const STATUS_TONES: Record<ConnectionStatus, StatusTone> = {
  na_cekanju: "neutral",
  prihvaceno: "success",
  odbijeno: "danger",
};

const contactOf = (c?: Company) => [c?.address, c?.phone].filter(Boolean).join(" · ") || "—";

export function ConnectionsContainer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());

  // suprotni tip firme: doktor traži laboratorije, laboratorija ordinacije
  const counterpartType = session?.type === "doktor" ? "proteticar" : "doktor";
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
    enabled: !!session,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["connections"] });
  const respond = useMutation({
    mutationFn: (v: { id: string; status: "prihvaceno" | "odbijeno" }) => respondToConnection(v.id, v.status),
    onSuccess: invalidate,
  });
  const send = useMutation({ mutationFn: sendConnectionRequest, onSuccess: invalidate });

  const companiesById = new Map((companiesQuery.data?.companies ?? []).map((c) => [c.id, c]));
  const connections = connectionsQuery.data?.connections ?? [];
  const counterpartId = (c: Connection) => (session?.type === "doktor" ? c.technicianId : c.doctorId);
  const isReceived = (c: Connection) => c.senderId !== myCompanyId;

  const filters: Record<Tab, (c: Connection) => boolean> = {
    active: (c) => c.status === "prihvaceno",
    received: (c) => c.status === "na_cekanju" && isReceived(c),
    sent: (c) => c.status === "na_cekanju" && !isReceived(c),
  };
  const tabs = [
    { value: "active", label: "Aktivne" },
    { value: "received", label: "Primljeni zahtevi" },
    { value: "sent", label: "Poslati zahtevi" },
  ].map((t) => ({ ...t, count: connections.filter(filters[t.value as Tab]).length }));

  const rows: ConnectionRow[] = connections.filter(filters[tab]).map((c) => {
    const company = companiesById.get(counterpartId(c));
    return {
      id: c.id,
      name: company?.name ?? "…",
      contact: contactOf(company),
      statusLabel: STATUS_LABELS[c.status],
      statusTone: STATUS_TONES[c.status],
      canRespond: c.status === "na_cekanju" && isReceived(c),
    };
  });

  const connectedIds = new Map(connections.map((c) => [counterpartId(c), c]));
  const searchResults: CompanyRow[] = (searchQuery.data?.companies ?? []).map((company) => {
    const existing = connectedIds.get(company.id);
    return {
      id: company.id,
      name: company.name,
      contact: contactOf(company),
      disabledReason: existing ? `Veza postoji (${STATUS_LABELS[existing.status].toLowerCase()})` : null,
    };
  });

  return (
    <ConnectionsView
      counterpartPlural={session?.type === "doktor" ? "Laboratorije" : "Ordinacije"}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as Tab)}
      rows={rows}
      onRespond={(id, status) => respond.mutate({ id, status })}
      respondingId={respond.isPending ? (respond.variables?.id ?? null) : null}
      search={search}
      onSearchChange={setSearch}
      searchResults={searchResults}
      isSearching={searchQuery.isPending}
      onSendRequest={(companyId) => send.mutate(companyId)}
      sendingId={send.isPending ? (send.variables ?? null) : null}
      isLoading={connectionsQuery.isPending}
      errorMessage={(connectionsQuery.error ?? respond.error ?? send.error)?.message}
    />
  );
}
