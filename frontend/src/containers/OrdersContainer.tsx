"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { OrdersList, type OrderRow } from "@/components/orders/OrdersList";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listOrders } from "@/lib/endpoints";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, ORDER_STATUSES } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/lib/types";

const PAGE_SIZE = 10;

const statusOptions = ORDER_STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABELS[value] }));


export function OrdersContainer() {
  const { session } = useAuth();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isPending, error } = useQuery({
    queryKey: ["orders", { status, page }],
    queryFn: () => listOrders({ status: status || undefined, page, pageSize: PAGE_SIZE }),
  });

  const isDoctor = session?.type === "doktor";
  const toRow = (o: Order): OrderRow => ({
    id: o.id,
    patientName: `${o.patientFirstName ?? ""} ${o.patientLastName ?? ""}`.trim(),
    counterpartName: (isDoctor ? o.technicianName : o.doctorName) ?? "—",
    statusLabel: ORDER_STATUS_LABELS[o.status],
    statusTone: ORDER_STATUS_TONES[o.status],
    deadline: formatDate(o.deliveryDeadline),
    createdAt: formatDate(o.createdAt),
  });

  return (
    <OrdersList
      rows={data?.orders.map(toRow) ?? []}
      counterpartHeader={isDoctor ? "Laboratorija" : "Ordinacija"}
      statusOptions={statusOptions}
      statusFilter={status}
      onStatusFilterChange={(value) => {
        setStatus(value as OrderStatus | "");
        setPage(1);
      }}
      page={page}
      totalPages={data ? Math.ceil(data.total / data.pageSize) : 1}
      onPageChange={setPage}
      isLoading={isPending}
      errorMessage={error?.message}
    />
  );
}
