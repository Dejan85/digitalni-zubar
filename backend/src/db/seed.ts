import bcrypt from "bcrypt";

import { pool } from "./pool";

// Sintetički podaci za razvoj/demo. Idempotentno: prvo briše sve što je ranije seed-ovano
// (firme sa emailom na @seed.test), pa ponovo upisuje. Lozinka svih naloga: SEED_PASSWORD.
const SEED_PASSWORD = "Lozinka123";
const DOMAIN = "seed.test";

const DOCTORS = [
  { name: "Ordinacija Osmeh", address: "Knez Mihailova 12, Beograd", phone: "011 322 1100", slug: "osmeh", spec: "Opšta stomatologija" },
  { name: "Dental Centar Novak", address: "Bulevar oslobođenja 45, Novi Sad", phone: "021 455 2020", slug: "novak", spec: "Protetika" },
  { name: "Stomatološka ordinacija Dr Petrović", address: "Nikole Pašića 7, Niš", phone: "018 512 3344", slug: "petrovic", spec: "Ortodoncija" },
];

const LABS = [
  { name: "Dentalna laboratorija Keramika", address: "Industrijska 3, Beograd", phone: "011 288 7001", slug: "keramika" },
  { name: "Protetika Plus", address: "Železnička 18, Novi Sad", phone: "021 630 8800", slug: "plus" },
  { name: "Laboratorija Zlatni Zub", address: "Cara Dušana 22, Kragujevac", phone: "034 301 4455", slug: "zlatni" },
];

const SERVICES = [
  ["Metalokeramička kruna", 9500],
  ["Cirkonijum kruna", 14500],
  ["Totalna proteza", 22000],
  ["Parcijalna proteza", 16000],
  ["Fasetna (veneer) keramička", 18000],
  ["Mostovi (po članu)", 12000],
  ["Akrilni nosač (splint)", 6500],
  ["Individualna kašika", 3000],
  ["Inlej/onlej keramički", 11000],
  ["Popravka proteze", 2500],
] as const;

const FIRST_NAMES_M = ["Marko", "Nikola", "Stefan", "Luka", "Milan", "Jovan", "Petar", "Dušan", "Aleksandar", "Vladimir"];
const FIRST_NAMES_F = ["Ana", "Marija", "Jelena", "Milica", "Ivana", "Teodora", "Sara", "Katarina", "Nina", "Tamara"];
const LAST_NAMES = ["Jovanović", "Petrović", "Nikolić", "Marković", "Đorđević", "Stojanović", "Ilić", "Stanković", "Pavlović", "Todorović", "Kostić", "Lazić"];

const ORDER_STATUSES = [
  "primljena", "primljena", "potvrdjena", "potvrdjena", "u_izradi", "u_izradi", "u_izradi",
  "poslata", "poslata", "isporucena", "isporucena", "isporucena", "isporucena",
  "otkazana", "odbijena", "vracena_na_doradu",
] as const;

const FREE_DESCRIPTIONS = ["Korekcija zagrižaja", "Hitna popravka mosta", "Bojenje po uzorku VITA A2", "Privremena kruna"];

// deterministički "random" da seed daje isti rezultat pri svakom pokretanju
let state = 42;
function rand(): number {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];

const dateOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

async function insertCompany(
  type: "doktor" | "proteticar",
  c: { name: string; address: string; phone: string; slug: string },
  passwordHash: string,
): Promise<string> {
  const email = `${c.slug}@${DOMAIN}`;
  const {
    rows: [firm],
  } = await pool.query<{ id: string }>(
    "INSERT INTO firme (naziv, tip, adresa, telefon, email) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [c.name, type, c.address, c.phone, email],
  );
  await pool.query("INSERT INTO korisnici (firma_id, email, password_hash) VALUES ($1, $2, $3)", [firm.id, email, passwordHash]);
  return firm.id;
}

async function clearPreviousSeed(): Promise<void> {
  const ids = `(SELECT id FROM firme WHERE email LIKE '%@${DOMAIN}')`;
  // porudzbine su RESTRICT prema firmama/pacijentima — brišu se prve (stavke, otisci, beleške idu kaskadno)
  await pool.query(`DELETE FROM porudzbine WHERE doktor_id IN ${ids} OR proteticar_id IN ${ids}`);
  await pool.query(`DELETE FROM firme WHERE email LIKE '%@${DOMAIN}'`);
}

async function seed(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  await clearPreviousSeed();

  const doctorIds: string[] = [];
  for (const d of DOCTORS) {
    const id = await insertCompany("doktor", d, passwordHash);
    await pool.query("INSERT INTO doktor_specijalizacije (firma_id, naziv) VALUES ($1, $2)", [id, d.spec]);
    doctorIds.push(id);
  }
  const labIds: string[] = [];
  for (const l of LABS) labIds.push(await insertCompany("proteticar", l, passwordHash));

  // veze: [doktor, lab, status, ko je poslao (d = doktor, l = lab)]
  const connections: [number, number, string, "d" | "l"][] = [
    [0, 0, "prihvaceno", "d"],
    [0, 1, "prihvaceno", "d"],
    [1, 0, "prihvaceno", "l"],
    [1, 2, "prihvaceno", "d"],
    [2, 1, "prihvaceno", "d"],
    [2, 0, "na_cekanju", "d"],
    [0, 2, "na_cekanju", "l"],
    [1, 1, "odbijeno", "d"],
  ];
  for (const [d, l, status, sender] of connections) {
    await pool.query(
      "INSERT INTO veze_doktor_proteticar (doktor_id, proteticar_id, status, posiljalac_id) VALUES ($1, $2, $3, $4)",
      [doctorIds[d], labIds[l], status, sender === "d" ? doctorIds[d] : labIds[l]],
    );
  }

  // usluge: svaka laboratorija nudi 7 usluga sa blago različitim cenama
  const servicesByLab: { id: string; price: number }[][] = [];
  for (const labId of labIds) {
    const list: { id: string; price: number }[] = [];
    for (const [name, basePrice] of SERVICES.slice(0, 7)) {
      const price = Math.round((basePrice * (0.9 + rand() * 0.25)) / 100) * 100;
      const {
        rows: [service],
      } = await pool.query<{ id: string }>("INSERT INTO usluge (proteticar_id, naziv, cena) VALUES ($1, $2, $3) RETURNING id", [labId, name, price]);
      list.push({ id: service.id, price });
    }
    servicesByLab.push(list);
  }

  // pacijenti: 10 po doktoru
  const patientsByDoctor: string[][] = [];
  for (const doctorId of doctorIds) {
    const list: string[] = [];
    for (let i = 0; i < 10; i++) {
      const female = i % 2 === 1;
      const year = 1950 + Math.floor(rand() * 55);
      const birthDate = `${year}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rand() * 28)).padStart(2, "0")}`;
      const {
        rows: [patient],
      } = await pool.query<{ id: string }>(
        "INSERT INTO pacijenti (doktor_id, ime, prezime, datum_rodjenja, pol) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [doctorId, pick(female ? FIRST_NAMES_F : FIRST_NAMES_M), pick(LAST_NAMES), birthDate, female ? "Z" : "M"],
      );
      list.push(patient.id);
    }
    patientsByDoctor.push(list);
  }

  // porudžbine: samo za prihvaćene veze
  let ordersCount = 0;
  for (const [d, l, status] of connections) {
    if (status !== "prihvaceno") continue;
    for (let i = 0; i < 8; i++) {
      const orderStatus = ORDER_STATUSES[(ordersCount + i * 3) % ORDER_STATUSES.length];
      // rok postoji tek kad je lab potvrdio; neki su blizu (alarmi), neki prošli (kasne)
      const hasDeadline = !["primljena", "odbijena"].includes(orderStatus);
      const deadlineOffset = orderStatus === "isporucena" ? -Math.floor(rand() * 20) - 3 : Math.floor(rand() * 21) - 2;
      const createdDaysAgo = 2 + Math.floor(rand() * 40);
      const patientId = pick(patientsByDoctor[d]);

      const {
        rows: [order],
      } = await pool.query<{ id: string }>(
        `INSERT INTO porudzbine (doktor_id, proteticar_id, pacijent_id, status, rok_isporuke, datum_kreiranja)
         VALUES ($1, $2, $3, $4, $5, now() - $6 * interval '1 day') RETURNING id`,
        [doctorIds[d], labIds[l], patientId, orderStatus, hasDeadline ? dateOffset(deadlineOffset) : null, createdDaysAgo],
      );
      ordersCount++;

      const itemCount = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < itemCount; k++) {
        if (rand() < 0.2) {
          await pool.query(
            "INSERT INTO stavke_porudzbine (porudzbina_id, slobodan_opis, kolicina, cena_u_trenutku) VALUES ($1, $2, 1, $3)",
            [order.id, pick(FREE_DESCRIPTIONS), 2000 + Math.floor(rand() * 8) * 500],
          );
        } else {
          const service = pick(servicesByLab[l]);
          await pool.query(
            "INSERT INTO stavke_porudzbine (porudzbina_id, usluga_id, kolicina, cena_u_trenutku) VALUES ($1, $2, $3, $4)",
            [order.id, service.id, 1 + Math.floor(rand() * 4), service.price],
          );
        }
      }

      if (rand() < 0.5) {
        await pool.query("INSERT INTO otisci (porudzbina_id, tip, napomena) VALUES ($1, 'analogni', $2)", [
          order.id,
          pick(["Alginat, gornja vilica", "Silikonski otisak, donja vilica", "Otisak sa registratom griza"]),
        ]);
      }

      if (rand() < 0.4) {
        await pool.query("INSERT INTO beleske (porudzbina_id, tip, tekst) VALUES ($1, 'rucna', $2)", [
          order.id,
          pick(["Pacijent traži svetliju nijansu.", "Pozvati pacijenta pre probe.", "Dogovoreno telefonom: hitno.", "Obratiti pažnju na zagrižaj."]),
        ]);
      }
    }
  }

  // beleške vezane za pacijente
  for (const patients of patientsByDoctor) {
    for (const patientId of patients.slice(0, 4)) {
      await pool.query("INSERT INTO beleske (pacijent_id, tip, tekst) VALUES ($1, 'rucna', $2)", [
        patientId,
        pick(["Alergija na penicilin.", "Pacijent je anksiozan, zakazivati ujutru.", "Nosi parcijalnu protezu 5 godina.", "Redovna kontrola na 6 meseci."]),
      ]);
    }
  }

  console.log(
    `Seed gotov: ${DOCTORS.length} ordinacije, ${LABS.length} laboratorije, ${connections.length} veza, ${ordersCount} porudžbina.`,
  );
  console.log(`Prijava (lozinka ${SEED_PASSWORD}): ${[...DOCTORS, ...LABS].map((c) => `${c.slug}@${DOMAIN}`).join(", ")}`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seed nije uspeo:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
