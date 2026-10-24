import { NewOrderContainer } from "@/containers/NewOrderContainer";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const { patientId } = await searchParams;
  return <NewOrderContainer initialPatientId={patientId} />;
}
