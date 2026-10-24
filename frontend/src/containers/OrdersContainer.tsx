"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { OrdersList } from "@/components/orders/OrdersList";
import { useAuth } from "@/lib/auth";
import { listOrders } from "@/lib/endpoints";
import {
  buildOrdersList,
  DATE_RANGE_OPTIONS,
  EMPTY_FILTERS,
  hasActiveFilters,
  ordersToCsv,
  type OrdersFilters,
} from "@/lib/orders-list";

const FETCH_LIMIT = 100; // maksimum koji backend vraća po stranici; filteri i paginacija rade nad ovim uzorkom
const PAGE_SIZE_OPTIONS = [10, 25, 50];

function downloadCsv(content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `porudzbine-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersContainer() {
  const { session } = useAuth();
  const [filters, setFilters] = useState<OrdersFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // isti query ključ kao kontrolna tabla i shell — jedan zahtev za sve troje
  const { data, isPending, error } = useQuery({
    queryKey: ["orders", "dashboard"],
    queryFn: () => listOrders({ pageSize: FETCH_LIMIT }),
    enabled: !!session,
  });

  const isDoctor = session?.type === "doktor";
  const list = useMemo(
    () => (data && session ? buildOrdersList(data.orders, session.type, filters) : null),
    [data, session, filters],
  );

  const totalRows = list?.rows.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const partnerLabel = isDoctor ? "Laboratorija" : "Ordinacija";

  // svaka promena filtera vraća na prvu stranu
  const updateFilters = (patch: Partial<OrdersFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const pageRows = list?.rows.slice(start, start + pageSize) ?? [];
  const allSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds.includes(r.id));

  return (
    <OrdersList
      rows={pageRows}
      kpis={list?.kpis ?? []}
      chips={list?.chips ?? []}
      partners={list?.partners ?? []}
      partnerLabel={partnerLabel}
      canCreate={isDoctor || session?.isSuperAdmin === true}
      timeLabel={new Date().toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" })}
      isPartial={!!data && data.total > data.orders.length}
      statusFilter={filters.status}
      onStatusFilterChange={(status) => updateFilters({ status })}
      search={filters.search}
      onSearchChange={(search) => updateFilters({ search })}
      partnerId={filters.partnerId}
      onPartnerChange={(partnerId) => updateFilters({ partnerId })}
      dateRange={filters.dateRange}
      dateRangeOptions={DATE_RANGE_OPTIONS}
      onDateRangeChange={(dateRange) => updateFilters({ dateRange })}
      hasFilters={hasActiveFilters(filters)}
      onResetFilters={() => updateFilters(EMPTY_FILTERS)}
      onExportCsv={() => list && downloadCsv(ordersToCsv(list.rows, partnerLabel))}
      selectedIds={selectedIds}
      allSelected={allSelected}
      onToggleRow={(id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
      onToggleAll={() =>
        setSelectedIds((prev) =>
          allSelected
            ? prev.filter((id) => !pageRows.some((r) => r.id === id))
            : [...new Set([...prev, ...pageRows.map((r) => r.id)])],
        )
      }
      totalRows={totalRows}
      rangeFrom={totalRows === 0 ? 0 : start + 1}
      rangeTo={Math.min(start + pageSize, totalRows)}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
      pageSize={pageSize}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      isLoading={isPending}
      errorMessage={error?.message}
    />
  );
}
