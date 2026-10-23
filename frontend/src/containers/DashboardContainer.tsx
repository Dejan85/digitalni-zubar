"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { getMyCompany } from "@/lib/endpoints";

// privremeno: potvrda da API klijent + token rade end-to-end; pravi dashboard je F4
export function DashboardContainer() {
  const { data, isPending, error } = useQuery({
    queryKey: ["company", "me"],
    queryFn: getMyCompany,
  });

  return <DashboardWelcome companyName={data?.company.name} isLoading={isPending} errorMessage={error?.message} />;
}
