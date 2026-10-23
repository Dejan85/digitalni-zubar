"use client";

import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/Card";
import { getMyCompany } from "@/lib/endpoints";

// privremeno: potvrda da API klijent + token rade end-to-end; pravi dashboard je F4
export default function DashboardPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["company", "me"],
    queryFn: getMyCompany,
  });

  return (
    <Card>
      {isPending && <p className="text-muted">Učitavanje...</p>}
      {error && <p className="text-danger">{error.message}</p>}
      {data && <h1 className="text-xl font-semibold text-primary-dark">Dobrodošli, {data.company.name}</h1>}
    </Card>
  );
}
