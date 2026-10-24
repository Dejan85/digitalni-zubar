import { NewOrderContainer } from "@/containers/NewOrderContainer";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ patientId?: string; technicianId?: string }> }) {
  const { patientId, technicianId } = await searchParams;
  return <NewOrderContainer initialPatientId={patientId} initialTechnicianId={technicianId} />;
}
