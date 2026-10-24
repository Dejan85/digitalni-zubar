"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "./auth";
import { buildDashboard } from "./dashboard";
import { listConnections, listOrders } from "./endpoints";

const ORDERS_LIMIT = 100; // maksimum koji backend vraća po stranici; brojke se računaju nad ovim uzorkom

// podaci kontrolne table (porudžbine + zahtevi za veze); koriste ih tabla i shell (značke u meniju, zvonce) — isti query ključevi, jedan zahtev
export function useDashboardData() {
  const { session } = useAuth();
  const orders = useQuery({
    queryKey: ["orders", "dashboard"],
    queryFn: () => listOrders({ pageSize: ORDERS_LIMIT }),
    enabled: !!session,
  });
  const requests = useQuery({
    queryKey: ["connections", "received-pending"],
    queryFn: () => listConnections({ direction: "primljene", status: "na_cekanju" }),
    enabled: !!session,
  });

  const data = useMemo(
    () =>
      orders.data && session
        ? buildDashboard(orders.data.orders, session.type, requests.data?.connections.length ?? 0)
        : null,
    [orders.data, requests.data, session],
  );

  return {
    data,
    isPending: orders.isPending,
    errorMessage: orders.error?.message,
    isPartial: !!orders.data && orders.data.total > orders.data.orders.length,
  };
}
