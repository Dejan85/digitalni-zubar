import { Card } from "@/components/ui/Card";

interface DashboardWelcomeProps {
  companyName?: string;
  isLoading: boolean;
  errorMessage?: string;
}

export function DashboardWelcome({ companyName, isLoading, errorMessage }: DashboardWelcomeProps) {
  return (
    <Card>
      {isLoading && <p className="text-muted">Učitavanje...</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      {companyName && <h1 className="text-xl font-semibold text-heading">Dobrodošli, {companyName}</h1>}
    </Card>
  );
}
