import { z } from "zod";

export const registerSchema = z.object({
  firma: z.object({
    naziv: z.string().min(1, "naziv firme je obavezan"),
    tip: z.enum(["doktor", "proteticar"]),
    adresa: z.string().min(1).optional(),
    telefon: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }),
  korisnik: z.object({
    email: z.string().email("email nije validan"),
    // min 8 karaktera je namerno jedino pravilo za sada — jaca politika lozinki nije u scope-u ovog koraka
    lozinka: z.string().min(8, "lozinka mora imati bar 8 karaktera"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("email nije validan"),
  lozinka: z.string().min(1, "lozinka je obavezna"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// .partial() jer PATCH sme da menja samo neko od ovih polja (nikad "naziv" ili "tip" — to nije kontakt podatak)
export const patchFirmaSchema = z
  .object({
    adresa: z.string().min(1),
    telefon: z.string().min(1),
    email: z.string().email("email nije validan"),
  })
  .partial();

export type PatchFirmaInput = z.infer<typeof patchFirmaSchema>;

export const createVezaSchema = z.object({
  // firma kojoj se salje zahtev za konekciju (druga strana, ne posiljalac)
  firmaId: z.string().uuid("firmaId mora biti validan UUID"),
});

export type CreateVezaInput = z.infer<typeof createVezaSchema>;

export const patchVezaStatusSchema = z.object({
  status: z.enum(["prihvaceno", "odbijeno"]),
});

export type PatchVezaStatusInput = z.infer<typeof patchVezaStatusSchema>;

export const createPacijentSchema = z.object({
  ime: z.string().min(1, "ime je obavezno"),
  prezime: z.string().min(1, "prezime je obavezno"),
  // "date" tip u Postgresu prihvata YYYY-MM-DD — regex ovde sprecava da string sa vremenom/pogresnim formatom prodje do baze
  datumRodjenja: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "datumRodjenja mora biti u formatu YYYY-MM-DD"),
  pol: z.enum(["M", "Z"]),
});

export type CreatePacijentInput = z.infer<typeof createPacijentSchema>;

// .partial() jer PATCH sme da menja samo neko od ovih polja
export const patchPacijentSchema = createPacijentSchema.partial();

export type PatchPacijentInput = z.infer<typeof patchPacijentSchema>;

export const createUslugaSchema = z.object({
  naziv: z.string().min(1, "naziv je obavezan"),
  cena: z.number().positive("cena mora biti pozitivan broj"),
});

export type CreateUslugaInput = z.infer<typeof createUslugaSchema>;

// .partial() jer PATCH sme da menja samo neko od ovih polja
export const patchUslugaSchema = createUslugaSchema.partial();

export type PatchUslugaInput = z.infer<typeof patchUslugaSchema>;

const stavkaPorudzbineSchema = z
  .object({
    uslugaId: z.string().uuid("uslugaId mora biti validan UUID").optional(),
    slobodanOpis: z.string().min(1).optional(),
    kolicina: z.number().int().positive("kolicina mora biti pozitivan ceo broj").default(1),
    // cena je obavezna samo za stavke bez uslugaId — za stavke iz kataloga se uzima iz baze, ne od klijenta
    cena: z.number().nonnegative("cena mora biti nenegativan broj").optional(),
  })
  .refine((stavka) => Boolean(stavka.uslugaId) || Boolean(stavka.slobodanOpis), {
    message: "stavka mora imati uslugaId ili slobodanOpis",
  })
  .refine((stavka) => Boolean(stavka.uslugaId) || stavka.cena !== undefined, {
    message: "stavka bez uslugaId (slobodan opis) mora imati cenu",
  });

export const createPorudzbinaSchema = z.object({
  proteticarId: z.string().uuid("proteticarId mora biti validan UUID"),
  pacijentId: z.string().uuid("pacijentId mora biti validan UUID"),
  stavke: z.array(stavkaPorudzbineSchema).min(1, "porudzbina mora imati bar jednu stavku"),
});

export type CreatePorudzbinaInput = z.infer<typeof createPorudzbinaSchema>;

// "primljena" je pocetni status koji se postavlja samo pri kreiranju, nikad kroz PATCH
export const patchPorudzbinaStatusSchema = z.object({
  status: z.enum(["potvrdjena", "u_izradi", "poslata", "isporucena", "otkazana", "odbijena", "vracena_na_doradu"]),
  // datum kad protetičar planira da isporuci porudzbinu — najcesce se upisuje uz prelazak u "potvrdjena"
  rokIsporuke: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "rokIsporuke mora biti u formatu YYYY-MM-DD")
    .optional(),
});

export type PatchPorudzbinaStatusInput = z.infer<typeof patchPorudzbinaStatusSchema>;

// stize kao multipart/form-data (uz opcioni fajl) — polja su zbog toga stringovi, ne JSON tipovi
export const createOtisakSchema = z
  .object({
    tip: z.enum(["digitalni", "analogni"]),
    napomena: z.string().min(1).optional(),
  })
  // analogni otisak nema fajl (provereno u ruti) pa mora imati bar napomenu da ne bude prazan zapis
  .refine((otisak) => otisak.tip !== "analogni" || Boolean(otisak.napomena), {
    message: "napomena je obavezna za analogni otisak",
    path: ["napomena"],
  });

export type CreateOtisakInput = z.infer<typeof createOtisakSchema>;

// tip nije u body-ju — beleska kreirana kroz ovu rutu je uvek "rucna", "automatska" pravi iskljucivo sistem
export const createBeleskaSchema = z
  .object({
    porudzbinaId: z.string().uuid("porudzbinaId mora biti validan UUID").optional(),
    pacijentId: z.string().uuid("pacijentId mora biti validan UUID").optional(),
    tekst: z.string().min(1, "tekst je obavezan"),
  })
  // ista provera kao DB constraint (beleske_porudzbina_ili_pacijent) — dupliramo je ovde da greska bude jasna 400 poruka, ne gola 500 iz baze
  .refine((beleska) => Boolean(beleska.porudzbinaId) || Boolean(beleska.pacijentId), {
    message: "beleska mora imati porudzbinaId ili pacijentId",
  });

export type CreateBeleskaInput = z.infer<typeof createBeleskaSchema>;
