// Granica prema backendu: backend priča srpskim ASCII nazivima (snake_case u odgovorima, camelCase u zahtevima),
// frontend kod koristi isključivo engleske camelCase nazive. Ovde je jedino mesto gde se dva rečnika sreću.

// ključ iz backend odgovora → naziv u frontend kodu (nepoznati ključevi se samo prebace u camelCase)
const RESPONSE_KEYS: Record<string, string> = {
  doktor_id: "doctorId",
  proteticar_id: "technicianId",
  posiljalac_id: "senderId",
  pacijent_id: "patientId",
  usluga_id: "serviceId",
  porudzbina_id: "orderId",
  naziv: "name",
  tip: "type",
  adresa: "address",
  telefon: "phone",
  ime: "firstName",
  prezime: "lastName",
  datum_rodjenja: "birthDate",
  pol: "gender",
  cena: "price",
  cena_u_trenutku: "priceAtOrder",
  slobodan_opis: "freeDescription",
  kolicina: "quantity",
  fajl_path: "filePath",
  napomena: "note",
  rok_isporuke: "deliveryDeadline",
  datum_kreiranja: "createdAt",
  datum: "date",
  tekst: "text",
  pacijent_ime: "patientFirstName",
  pacijent_prezime: "patientLastName",
  doktor_naziv: "doctorName",
  proteticar_naziv: "technicianName",
  stavke: "items",
  otisci: "impressions",
  porudzbine: "orders",
  porudzbina: "order",
  pacijenti: "patients",
  pacijent: "patient",
  firme: "companies",
  firma: "company",
  veze: "connections",
  veza: "connection",
  usluge: "services",
  usluga: "service",
  beleske: "notes",
  beleska: "note",
  korisnik: "user",
  otisak: "impression",
  korisnikId: "userId",
  firmaId: "companyId",
};

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

// rekurzivno preimenuje ključeve objekata/nizova iz backend odgovora
export function fromWire<T>(value: unknown): T {
  if (Array.isArray(value)) return value.map((item) => fromWire(item)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [RESPONSE_KEYS[key] ?? snakeToCamel(key), fromWire(v)]),
    ) as T;
  }
  return value as T;
}
