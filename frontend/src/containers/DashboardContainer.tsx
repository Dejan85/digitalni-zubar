"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { useAuth } from "@/lib/auth";
import type { RecentFilter } from "@/lib/dashboard";
import { getMyCompany } from "@/lib/endpoints";
import { useDashboardData } from "@/lib/use-dashboard";

// kontrolna tabla: podaci i filteri; sve prikazane brojke izvodi lib/dashboard.ts
export function DashboardContainer() {
  const { session } = useAuth();
  const [recentFilter, setRecentFilter] = useState<RecentFilter>("all");
  const company = useQuery({ queryKey: ["company", "me"], queryFn: getMyCompany });
  const { data, isPending, errorMessage, isPartial } = useDashboardData();

  const isDoctor = session?.type === "doktor";
  return (
    <DashboardView
      companyName={company.data?.company.name}
      isDoctor={isDoctor}
      canCreateOrder={isDoctor || session?.isSuperAdmin === true}
      timeLabel={new Date().toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" })}
      data={data}
      isPartial={isPartial}
      recentFilter={recentFilter}
      onRecentFilterChange={setRecentFilter}
      isLoading={isPending}
      errorMessage={errorMessage}
    />
  );
}
