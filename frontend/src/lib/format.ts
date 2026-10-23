// prikaz datuma za korisnika (npr. 05.03.1980.)
export const formatDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString("sr-Latn-RS") : "—";

// cena za prikaz (npr. 12.500,00 RSD); numeric iz Postgresa stiže kao string
export const formatPrice = (price: string | number): string =>
  Number(price).toLocaleString("sr-Latn-RS", { style: "currency", currency: "RSD" });

// vrednost za <input type="date"> (YYYY-MM-DD) u lokalnoj zoni — pg `date` stiže kao ponoć lokalnog vremena
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
