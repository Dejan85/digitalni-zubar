import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/components/ui/Icon";
import {
  MOCK_FACILITY_STATUS,
  MOCK_IDENTITY,
  MOCK_LOGO,
  MOCK_SCANNERS,
  MOCK_SESSIONS,
  MOCK_SPECIALIZATIONS,
  MOCK_STORAGE,
  MOCK_TEAM_COUNT,
  MOCK_TWO_FACTOR_TEXT,
} from "@/lib/profile-mock";

// markup je prenet iz dizajn/profil/code.html (iste Tailwind klase); stvarna su samo polja adresa/telefon/email i naziv firme,
// sve ostalo je mock iz lib/profile-mock.ts ili disabled ("Uskoro") — spisak u documentation/REDIZAJN_MOCK.md §12

type FieldName = "address" | "phone" | "email";

interface ProfileViewProps {
  companyName?: string;
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isLoading: boolean; // dugme čuvanja je neaktivno dok podaci ne stignu
  isSubmitting: boolean;
  syncedAt: string; // "HH:mm" poslednjeg učitavanja/čuvanja
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDiscard: () => void;
}

const FORM_ID = "profile-form";

const inputBase =
  "w-full rounded-xl bg-surface-container-lowest text-on-surface shadow-sm outline-none transition-all focus:bg-surface-container-low";
const inputPlain = `${inputBase} px-3.5 py-2.5 font-body-md text-body-md`;
const inputMono = `${inputBase} px-3.5 py-2.5 font-data-mono text-data-mono`;
const inputWithIcon = `${inputBase} pl-11 pr-3.5 py-2.5`;
const labelClass = "font-label-md text-label-md text-on-surface font-medium";
const sectionClass = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg";
const sectionHeaderClass =
  "flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-low/40 p-4 rounded-lg";

const NAV_ITEMS = [
  { icon: "domain", label: "Opšti podaci ordinacije", active: true },
  { icon: "group", label: "Lekari i tim", count: MOCK_TEAM_COUNT },
  { icon: "hub", label: "Integracije & STL skeneri", dot: true },
  { icon: "notifications_active", label: "Obaveštenja i alarmi" },
  { icon: "lock_reset", label: "Bezbednost i lozinka" },
  { icon: "palette", label: "Tema i izgled interfejsa" },
];

const SCANNER_ICON_TONE = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  muted: "text-on-surface-variant",
};

export function ProfileView(props: ProfileViewProps) {
  const { errors, fields } = props;

  const statusText = props.formError ? (
    <span role="alert" className="text-error">
      {props.formError}
    </span>
  ) : (
    <span>
      Sve izmene su automatski sinhronizovane u{" "}
      <strong className="font-data-mono text-on-surface font-semibold">{props.syncedAt}</strong>
    </span>
  );

  return (
    <>
      {/* Breadcrumbs & Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg gap-space-md">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <Link className="hover:text-primary transition-colors" href="/dashboard">
              Početna
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-primary font-semibold">Profil i podešavanja</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            Profil ordinacije i bezbednost naloga
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Upravljajte osnovnim podacima ordinacije, licencama, digitalnim CAD/CAM skenerima i bezbednosnim protokolima ustanove.
          </p>
        </div>
        {/* Quick Status Overview Metric Pill */}
        <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm self-start md:self-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container text-primary">
            <Icon name="verified_user" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status ustanove</span>
            <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              {MOCK_FACILITY_STATUS}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace: Left Nav + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg pb-28">
        {/* Secondary Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-sm flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={!item.active}
                title={item.active ? undefined : "Uskoro"}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-title-sm text-title-sm text-left ${
                  item.active
                    ? "bg-primary text-on-primary shadow-sm transition-all"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="text-[20px]" />
                  <span>{item.label}</span>
                </div>
                {item.active && <span className="w-1.5 h-1.5 rounded-full bg-on-primary"></span>}
                {item.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-data-mono text-[11px] font-semibold">
                    {item.count}
                  </span>
                )}
                {item.dot && <span className="w-2 h-2 rounded-full bg-primary-container"></span>}
              </button>
            ))}
          </div>
          {/* Quick Storage & CAD/CAM Capacity Badge */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold tracking-wider">
                Cloud STL Skladište
              </span>
              <span className="font-data-mono text-data-mono font-semibold text-primary">{MOCK_STORAGE.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_STORAGE.percent}%` }}></div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{MOCK_STORAGE.text}</p>
          </div>
        </div>

        {/* Right Workspace Forms */}
        <form id={FORM_ID} onSubmit={props.onSubmit} noValidate className="lg:col-span-9 flex flex-col gap-space-lg">
          {/* SECTION A: Podaci o zdravstvenoj ustanovi */}
          <section className={sectionClass}>
            <div className={sectionHeaderClass}>
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Icon name="apartment" className="text-primary text-[22px]" />
                  Podaci o zdravstvenoj ustanovi
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Zvanični administrativni i pravni profil registrovan kod Komore i laboratorijskih partnera
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-label-sm font-semibold uppercase tracking-wider self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Privatna stomatološka praksa
              </span>
            </div>

            {/* Clinic Branding & Logo Row */}
            <div className="flex flex-col sm:flex-row items-center gap-space-md bg-surface-container-low/30 p-space-md rounded-xl">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" alt={MOCK_LOGO.alt} src={MOCK_LOGO.url} />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>
              <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface">Zvanični amblem i pečat ordinacije</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ovaj vizuelni identitet se prikazuje zubotehničkim laboratorijama na digitalnim radnim nalozima i profakturama.
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-space-sm pt-1">
                  <button
                    type="button"
                    disabled
                    title="Uskoro"
                    className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="photo_camera" className="text-[18px]" />
                    Promeni fotografiju
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Uskoro"
                    className="px-3 py-1.5 rounded-lg hover:bg-error-container text-error font-title-sm text-title-sm font-medium transition-colors"
                  >
                    Ukloni
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Naziv ordinacije (stvarno, ali backend ne dozvoljava izmenu naziva) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="company-name" className={`${labelClass} flex items-center justify-between`}>
                  <span>Naziv ordinacije / ustanove</span>
                  <span className="text-primary font-label-sm text-label-sm">Obavezno</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  className={inputPlain}
                  key={props.companyName}
                  defaultValue={props.companyName ?? ""}
                  placeholder={props.isLoading ? "Učitavanje..." : undefined}
                />
              </div>
              {/* Specijalizacija */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="specialization" className={labelClass}>
                  Primarna specijalizacija ordinacije
                </label>
                <div className="relative" title="Uskoro">
                  <select
                    id="specialization"
                    aria-disabled tabIndex={-1}
                    defaultValue={MOCK_SPECIALIZATIONS[0]}
                    className={`${inputPlain} appearance-none pr-10 cursor-pointer pointer-events-none`}
                  >
                    {MOCK_SPECIALIZATIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <Icon
                    name="unfold_more"
                    className="absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]"
                  />
                </div>
              </div>
              {/* Matični broj */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="registration-number" className={labelClass}>
                  Matični broj (MB)
                </label>
                <input
                  id="registration-number"
                  type="text"
                  readOnly
                  title="Uskoro"
                  defaultValue={MOCK_IDENTITY.registrationNumber}
                  className={inputMono}
                />
              </div>
              {/* PIB */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tax-id" className={labelClass}>
                  Poreski identifikacioni broj (PIB)
                </label>
                <input id="tax-id" type="text" readOnly title="Uskoro" defaultValue={MOCK_IDENTITY.taxId} className={inputMono} />
              </div>
              {/* Broj licence Komore */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="license" className={`${labelClass} flex items-center justify-between`}>
                  <span>Broj licence Komore (Stomatološka komora Srbije)</span>
                  <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                    <Icon name="verified" className="text-[15px]" />
                    Verifikovano u bazi SKS
                  </span>
                </label>
                <div className="relative flex items-center" title="Uskoro">
                  <Icon name="badge" className="absolute left-3.5 text-primary text-[20px]" />
                  <input
                    id="license"
                    type="text"
                    readOnly
                    defaultValue={MOCK_IDENTITY.license}
                    className={`${inputWithIcon} font-data-mono text-data-mono font-medium`}
                  />
                </div>
              </div>
              {/* Adresa (stvarno) */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Zvanična adresa i sedište ordinacije
                </label>
                <div className="relative flex items-center">
                  <Icon name="location_on" className="absolute left-3.5 text-on-surface-variant text-[20px]" />
                  <input
                    id="address"
                    type="text"
                    aria-invalid={!!errors.address}
                    className={`${inputWithIcon} font-body-md text-body-md`}
                    {...fields.address}
                  />
                </div>
              </div>
              {/* Telefon (stvarno) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className={labelClass}>
                  Službeni kontakt telefon
                </label>
                <div className="relative flex items-center">
                  <Icon name="call" className="absolute left-3.5 text-on-surface-variant text-[20px]" />
                  <input
                    id="phone"
                    type="text"
                    aria-invalid={!!errors.phone}
                    className={`${inputWithIcon} font-data-mono text-data-mono`}
                    {...fields.phone}
                  />
                </div>
              </div>
              {/* Email (stvarno) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className={labelClass}>
                  Službena email adresa
                </label>
                <div className="relative flex items-center">
                  <Icon name="mail" className="absolute left-3.5 text-on-surface-variant text-[20px]" />
                  <input
                    id="email"
                    type="email"
                    aria-invalid={!!errors.email}
                    className={`${inputWithIcon} font-body-md text-body-md`}
                    {...fields.email}
                  />
                </div>
              </div>
              {/* Radno vreme kurira */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="courier-hours" className={`${labelClass} flex items-center justify-between`}>
                  <span>Radno vreme za kurirski prijem i otpremu fizičkih otisaka</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Vidljivo kurirskoj službi laba</span>
                </label>
                <div className="relative flex items-center" title="Uskoro">
                  <Icon name="local_shipping" className="absolute left-3.5 text-on-surface-variant text-[20px]" />
                  <input
                    id="courier-hours"
                    type="text"
                    readOnly
                    defaultValue={MOCK_IDENTITY.courierHours}
                    className={`${inputWithIcon} font-body-md text-body-md`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: Povezani intraoralni skeneri */}
          <section className={sectionClass}>
            <div className={sectionHeaderClass}>
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Icon name="view_in_ar" className="text-primary text-[22px]" />
                  Povezani intraoralni skeneri (Digitalni otisci)
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Automatska sinhronizacija 3D optičkih skenova direktno sa ordinacijskih uređaja
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-primary-fixed text-on-primary-fixed font-data-mono text-[11px] font-bold uppercase tracking-wider self-start sm:self-auto">
                Cloud Sync Aktivan
              </span>
            </div>

            <div className="grid grid-cols-1 gap-space-sm">
              {MOCK_SCANNERS.map((scanner) => (
                <div
                  key={scanner.name}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl transition-colors gap-space-md ${
                    scanner.status.connected ? "bg-surface-container-low/50 hover:bg-surface-container-low" : "bg-surface-container-low/20"
                  }`}
                >
                  <div className="flex items-center gap-space-md">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        scanner.status.connected ? "bg-surface-container-lowest shadow-sm" : "bg-surface-container-low"
                      } ${SCANNER_ICON_TONE[scanner.iconTone]}`}
                    >
                      <Icon name={scanner.icon} className="text-[26px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">{scanner.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                            scanner.status.connected
                              ? "bg-surface-container-highest text-on-surface font-semibold"
                              : "bg-surface-container-high text-on-surface-variant font-medium"
                          }`}
                        >
                          {scanner.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${scanner.status.connected ? "bg-primary" : "bg-secondary"}`}></span>
                        <span
                          className={`font-body-sm text-body-sm font-medium ${scanner.status.connected ? "text-primary" : "text-secondary"}`}
                        >
                          {scanner.status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {scanner.status.connected ? (
                      <>
                        <button
                          type="button"
                          disabled
                          title="Uskoro"
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-sm font-title-sm text-title-sm transition-colors flex items-center gap-1.5"
                        >
                          <Icon name="sync" className="text-[16px]" />
                          Test veze
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Uskoro"
                          className="px-3 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors font-title-sm text-title-sm"
                        >
                          Podešavanja
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Uskoro"
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Icon name="add_link" className="text-[16px]" />
                        Poveži nalog
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-space-md rounded-xl bg-surface-container-high/40 text-on-surface">
              <Icon name="info" className="text-primary text-[22px] shrink-0 mt-0.5" />
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                <strong className="font-semibold text-on-surface">Automatsko prilaganje datoteka:</strong> Izvezeni STL, PLY i OBJ
                fajlovi sa povezanih skenera se automatski prilažu uz novi nalog za laboratoriju odmah nakon skeniranja pacijenta u
                ordinaciji, bez potrebe za ručnim skidanjem na fleš disk.
              </p>
            </div>
          </section>

          {/* SECTION C: Sigurnost naloga i pristup */}
          <section className={sectionClass}>
            <div className={sectionHeaderClass}>
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Icon name="shield" className="text-primary text-[22px]" />
                  Sigurnost naloga i pristup
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Lozinke, dvofaktorska zaštita i evidencija aktivnih sesija ordinacije
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold tracking-wider self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                2FA Zaštićeno
              </span>
            </div>

            {/* Promena lozinke */}
            <div className="flex flex-col gap-space-md">
              <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                <Icon name="key" className="text-[18px] text-on-surface-variant" />
                Promena lozinke
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md" title="Uskoro">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="current-password" className={labelClass}>
                    Trenutna lozinka
                  </label>
                  <input id="current-password" type="password" disabled placeholder="••••••••••••" className={inputPlain} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className={labelClass}>
                    Nova lozinka
                  </label>
                  <input id="new-password" type="password" disabled placeholder="Unesite novu lozinku" className={inputPlain} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className={labelClass}>
                    Potvrdi novu lozinku
                  </label>
                  <input id="confirm-password" type="password" disabled placeholder="Ponovite novu lozinku" className={inputPlain} />
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="p-space-md rounded-xl bg-surface-container-low/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
                  <Icon name="phonelink_lock" className="text-[24px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">Dvofaktorska autentifikacija (2FA)</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{MOCK_TWO_FACTOR_TEXT}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  disabled
                  title="Uskoro"
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-title-sm text-title-sm font-semibold transition-colors"
                >
                  Konfiguriši 2FA
                </button>
              </div>
            </div>

            {/* Aktivne sesije */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                  <Icon name="devices" className="text-[18px] text-on-surface-variant" />
                  Aktivne sesije naloga
                </h3>
                <button
                  type="button"
                  disabled
                  title="Uskoro"
                  className="px-3 py-1 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors font-title-sm text-title-sm font-semibold flex items-center gap-1.5"
                >
                  <Icon name="logout" className="text-[16px]" />
                  Odjavi sve ostale sesije
                </button>
              </div>
              {MOCK_SESSIONS.map((session) => (
                <div
                  key={session.device}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 ${
                        session.isCurrent ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      <Icon name={session.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      {session.isCurrent ? (
                        <div className="flex items-center gap-2">
                          <span className="font-title-sm text-title-sm text-on-surface font-semibold">{session.device}</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-data-mono text-[10px] font-bold uppercase">
                            Trenutna sesija
                          </span>
                        </div>
                      ) : (
                        <span className="font-title-sm text-title-sm text-on-surface font-medium">{session.device}</span>
                      )}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{session.details}</span>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <Icon name="check_circle" className="text-primary text-[20px]" />
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-label="Prekini sesiju"
                      title="Uskoro"
                      className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg hover:bg-surface-container"
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </form>
      </div>

      {/* Fiksna traka: sinhronizacija + akcije (levo se poravnava uz sidebar od md) */}
      <div className="fixed bottom-0 right-0 left-64 bg-surface-container-lowest/95 backdrop-blur-xl shadow-lg px-space-lg py-3.5 z-30 flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-2.5 text-on-surface-variant">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
          <span className="font-body-md text-body-md">{statusText}</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={props.onDiscard}
            disabled={props.isSubmitting}
            className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm font-semibold transition-colors"
          >
            Odbaci izmene
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={props.isSubmitting || props.isLoading}
            className="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Icon name="save" className="text-[18px]" />
            <span>Sačuvaj podešavanja</span>
          </button>
        </div>
      </div>
    </>
  );
}
