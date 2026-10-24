import { hash } from "./orders-mock";

// ⚠ MOCK PODACI — dizajn povezanih saradnika (dizajn/povezani saradnici) prikazuje polja koja backend nema:
// fotografiju, ocenu, rastojanje, kontakt osobu, ugovor, poštovanje rokova, oznake tehnologija, verifikaciju i poruku uz zahtev.
// Popunjavaju se deterministički iz ID-ja firme (isti ID → uvek isti prikaz). Stvarno ostaje: naziv, adresa, telefon/email,
// status veze, broj radova. Spisak odstupanja: documentation/REDIZAJN_MOCK.md §10.

export interface MockPartnerExtras {
  imageUrl: string;
  imageAlt: string;
  badge: { label: string; icon: string; tone: "primary" | "secondary" };
  express: boolean;
  labTypeLabel: string; // oznaka iznad naziva kad je partner laboratorija
  distance: string; // npr. "2.4 km"
  rating: string;
  mockWorks: number; // prikazuje se samo kad nema stvarnih radova
  tags: string[];
  contactPerson: string;
  contract: { label: string; tone: "primary" | "tertiary" };
  punctuality: string;
  requestQuote: string;
  requestIcon: string;
}

const PARTNERS: MockPartnerExtras[] = [
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCs1mOGuIO0feqBNrI7F-PPRTnlA6J0hc3kJUlcrSK01sfdQLPqnb8HL0Q37KsNd8VOS27u8H_-VdxGUQuTAL7Q8a7gOpiZDexpmnFVpZIpSkpV6kaYM2fdrHD5TA8qXf4e32UkTcR6rL8YS_kgCcD1BfWtWemSkEPcc0TGMIqehBVaGagFqq-rDuRNX27lzswkoaXr10ZbV3p3Ce5Tt_yR94PxXjfUwG2zAiNdX1YIXRSjuN_Vzdil",
    imageAlt: "Zubotehničar kalibriše CAD/CAM mašinu u modernoj laboratoriji",
    badge: { label: "Verifikovan partner", icon: "verified", tone: "primary" },
    express: false,
    labTypeLabel: "Zubotehnička laboratorija",
    distance: "2.4 km",
    rating: "4.9",
    mockWorks: 142,
    tags: ["CAD/CAM 5-osa", "Trios Ready", "IPS e.max", "3D Print"],
    contactPerson: "Petar Jovanović",
    contract: { label: "Ugovor: -5% rabat", tone: "primary" },
    punctuality: "99.2% poštovanje rokova",
    requestQuote: "Specijalizovani za bezmetalnu keramiku i lasersko sinterovanje Co-Cr. Nudimo besplatno preuzimanje prvih 3 naloga za testiranje kvaliteta.",
    requestIcon: "precision_manufacturing",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBkj7y9yxqB_4QXlzQaIAhQQG4VleLgRN1tSstkvo3j3U3UhFj5ij6P3-PFtIPDlI8V7-AyoxKxzYASJlXHRuUuBzbLWYidV7YOwuX-LF2-GCtTz-xiZOd_-yIYpFDolytxohcjCaaYoaFjatxQ2j4FVWhJhISGXKNAq9B2cG_387yjpyFCue_Q1YHnVPWgUHuFEmd0iFQzvSuOBcqoGK7w2Laj_OuEh5-CoWSSlwl5AY3j84u_g4Q",
    imageAlt: "Zubotehničar radi na keramičkim krunama na artikulatoru",
    badge: { label: "Verifikovan partner", icon: "verified", tone: "primary" },
    express: false,
    labTypeLabel: "Zubotehnička laboratorija",
    distance: "DExpress kurir",
    rating: "4.8",
    mockWorks: 88,
    tags: ["Metal-keramika", "Skeletirane proteze", "Ivoclar zubi", "Zirkonzahn"],
    contactPerson: "Milan Vasić",
    contract: { label: "Sinhronizovan cenovnik", tone: "primary" },
    punctuality: "97.8% poštovanje rokova",
    requestQuote: "Ekspresna izrada cirkonijumskih konstrukcija, podrška za Medit i 3Shape skenere, isporuka isti dan za hitne popravke proteza.",
    requestIcon: "biotech",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWMz8kZF9DM9CWzX_aA3PL7gWK3sxsBK8OJQNoh65IpqtmYJmFVzAx86b9gR75SOIZPhAIvKYsdG4cwnL0Qbap7TXaD1j-sHAhrmc7y0Fe0sHc7uA2RWQNxeazwvPVMyPIC5eKUf-elfo_-Wwv8Z-sJGFFYPh3LtlCx-QsJ9IMnjXFoVafbxGB7U4z3ehPi3i2XcH274M4qO1_1srYbvLNqjhxaGh5B8jN5QoPkzn0bqSj-2S_y6wk",
    imageAlt: "Softver za dizajn hirurških vodiča i 3D štampani šabloni",
    badge: { label: "Partner u test periodu", icon: "science", tone: "secondary" },
    express: false,
    labTypeLabel: "Implantoprotetski centar",
    distance: "Medijana",
    rating: "4.7",
    mockWorks: 19,
    tags: ["Implantologija", "Hirurški vodiči", "Titanijumske prečke", "All-on-4/6"],
    contactPerson: "Stefan Todorović",
    contract: { label: "Probni ugovor (još 14 dana)", tone: "tertiary" },
    punctuality: "100% prijem",
    requestQuote: "Specijalizovani za bezmetalnu keramiku i lasersko sinterovanje Co-Cr. Nudimo besplatno preuzimanje prvih 3 naloga za testiranje kvaliteta.",
    requestIcon: "precision_manufacturing",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwNVQ8zSN2zNi_-tVfeyOBsQb9M2yRDNs0iQ2Keqrx8ptG46BvdsS_LnZCfZ1aOCIDXgHpXhS_DEgMiHkBKIPNdjDF0CsJFvuIDCNKXuWXtgJ1r2T94rRkfeCIyU-d8QT78BiekANVzPiaDSWHst0Gv72i1ju-OyAFFDZfS0TCQ_H7YNfV-2B4LZ3e4Sa3A6EpENbZDUJNqyjEOpU13jIriw41vVWle5Un-cFOWs8ruIofwRXAuORU",
    imageAlt: "Višeslojni cirkonijumski disk posle sinterovanja",
    badge: { label: "Verifikovan partner", icon: "verified", tone: "primary" },
    express: true,
    labTypeLabel: "Cirkon & Estetika",
    distance: "Centar",
    rating: "4.9",
    mockWorks: 64,
    tags: ["Višeslojni cirkon", "Straumann kompatibilno", "MIS", "Inlay / Onlay"],
    contactPerson: "Dragan Milić",
    contract: { label: "Ugovor: Brzi 24h rok", tone: "primary" },
    punctuality: "99.5% bez zastoja",
    requestQuote: "Ekspresna izrada cirkonijumskih konstrukcija, podrška za Medit i 3Shape skenere, isporuka isti dan za hitne popravke proteza.",
    requestIcon: "biotech",
  },
];

export const mockPartnerExtras = (companyId: string): MockPartnerExtras => PARTNERS[hash(companyId) % PARTNERS.length];

// KPI "Prosečan odziv partnera": u domenu se odziv na digitalni nalog ne meri
export const MOCK_RESPONSE_TIME = { value: "42", unit: "min" };

// "pre 3 sata" / "juče" / "pre 5 dana" za listu primljenih zahteva
export function formatReceivedAgo(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "upravo sada";
  if (minutes < 60) return `pre ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `pre ${hours} ${hours === 1 ? "sat" : hours < 5 ? "sata" : "sati"}`;
  const days = Math.round(hours / 24);
  return days === 1 ? "juče" : `pre ${days} dana`;
}
