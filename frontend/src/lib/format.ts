// prikaz datuma za korisnika (npr. 05.03.1980.)
export const formatDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString("sr-Latn-RS") : "—";

// vrednost za <input type="date"> (YYYY-MM-DD) u lokalnoj zoni — pg `date` stiže kao ponoć lokalnog vremena
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
