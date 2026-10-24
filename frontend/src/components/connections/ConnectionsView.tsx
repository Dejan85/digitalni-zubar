import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

// markup je prenet iz dizajn/povezani saradnici/code.html (iste Tailwind klase); podaci i filteri stižu gotovi kroz props

export interface PartnerCard {
  id: string;
  name: string;
  typeLabel: string; // "Zubotehnička laboratorija" / "Stomatološka ordinacija"
  address: string;
  contact: string; // telefon ili email
  tags: string[]; // nazivi usluga laboratorije (prazno za ordinacije)
  distance: string; // MOCK (rastojanje/kurir)
  worksCount: number; // stvaran broj radova (ili mock kad ih nema)
  rating: string; // MOCK
  badge: { label: string; icon: string; tone: "primary" | "secondary" }; // MOCK verifikacija
  express: boolean; // MOCK "24h Express"
  imageUrl: string; // MOCK fotografija
  imageAlt: string;
  contactPerson: string; // MOCK
  contract: { label: string; tone: "primary" | "tertiary" }; // MOCK
  punctuality: string; // MOCK
  statusLabel: string; // stvaran status veze (za kartice bez akcija)
  // šta kartica nudi: nalog (aktivna veza), odgovor (primljen zahtev), slanje zahteva (pretraga) ili samo status
  action:
    | { kind: "order"; companyId: string }
    | { kind: "respond"; canRespond: boolean }
    | { kind: "send"; disabledReason: string | null }
    | { kind: "status" };
}

export interface PendingRequest {
  id: string;
  name: string;
  address: string;
  phone: string;
  receivedAgo: string;
  contactPerson: string; // MOCK
  quote: string; // MOCK poruka uz zahtev
  icon: string; // MOCK
}

export interface ConnectionsKpis {
  active: number;
  newThisMonth: number;
  pending: number;
  received: number;
  sent: number;
  responseTime: { value: string; unit: string } | null;
  recommended: number;
}

interface ConnectionsViewProps {
  kpis: ConnectionsKpis;
  counterpartLabel: string; // "laboratoriju" / "ordinaciju"
  tabs: { value: string; label: string; count: number | null; highlight?: boolean }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  cards: PartnerCard[];
  pendingRequests: PendingRequest[];
  showPending: boolean;
  onRespond: (id: string, status: "prihvaceno" | "odbijeno") => void;
  respondingId: string | null;
  onSendRequest: (companyId: string) => void;
  sendingId: string | null;
  isLoading: boolean;
  errorMessage?: string;
}

// MOCK: filteri iz dizajna (backend nema grad, tip usluge ni ugovor) — onemogućeni
const MOCK_FILTERS = [
  ["Svi gradovi", "Beograd", "Novi Sad", "Niš", "Kragujevac"],
  ["Sve usluge", "Fiksna protetika", "Mobilna protetika", "Implantoprotetika"],
  ["Status ugovora: Svi", "Aktivan ugovor", "Na pauzi"],
];

const DISABLED_SELECT =
  "appearance-none rounded-lg bg-surface-container-low py-2.5 pl-3.5 pr-8 font-title-sm text-title-sm text-on-surface opacity-60 outline-none";

function KpiCard(props: { label: string; icon: string; iconBox: string; footer: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-medium text-on-surface-variant">{props.label}</span>
          {props.children}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${props.iconBox}`}>
          <Icon name={props.icon} className="text-[22px]" />
        </div>
      </div>
      {props.footer}
    </div>
  );
}

const KPI_FOOTER = "-mx-5 -mb-5 mt-4 flex items-center gap-2 bg-surface-container-low px-5 py-2.5 pt-3";
const KPI_VALUE = "mt-1 font-display-lg text-display-lg font-bold text-on-surface";

function PartnerCardView(props: { card: PartnerCard } & Pick<ConnectionsViewProps, "onRespond" | "respondingId" | "onSendRequest" | "sendingId">) {
  const { card } = props;
  const { action } = card;
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="relative h-32 w-full overflow-hidden bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element -- MOCK fotografija iz dizajna, spoljni URL */}
          <img
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={card.imageAlt}
            src={card.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold tracking-wide ${
                card.badge.tone === "primary" ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              <Icon name={card.badge.icon} className="text-[13px]" />
              {card.badge.label}
            </span>
            {card.express && (
              <span className="inline-flex items-center rounded-full bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-surface">
                24h Express
              </span>
            )}
          </div>
          <div className="absolute bottom-2.5 left-3 text-white">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary-fixed">{card.typeLabel}</span>
            <h3 className="font-headline-sm text-headline-sm font-bold leading-tight drop-shadow-sm">{card.name}</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="location_on" className="text-[16px] text-secondary" />
              <span className="truncate">
                {card.address} ({card.distance})
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1 rounded bg-surface-container-low px-2 py-0.5">
              <Icon name="star" className="text-[16px] text-amber-500 [font-variation-settings:'FILL'_1]" />
              <span className="font-title-sm text-title-sm font-bold text-on-surface">{card.rating}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">({card.worksCount} radova)</span>
            </div>
          </div>
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span key={tag} className="rounded bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
            <div className="flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Glavni kontakt:</span>
              <span className="font-semibold text-on-surface">{card.contactPerson}</span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Telefon / Email:</span>
              <span className="max-w-[170px] truncate font-data-mono text-[12px] text-primary">{card.contact}</span>
            </div>
            <div className="flex items-center justify-between border-t-0 pt-1.5 font-label-sm text-label-sm">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${card.contract.tone === "primary" ? "text-primary" : "text-tertiary"}`}
              >
                <span className={`size-1.5 rounded-full ${card.contract.tone === "primary" ? "bg-primary" : "bg-tertiary"}`} />
                {card.contract.label}
              </span>
              <span className="font-medium text-secondary">{card.punctuality}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-5 pb-5 pt-1">
        {action.kind === "order" && (
          <>
            <Link
              href={`/orders/new?technicianId=${action.companyId}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 font-title-sm text-title-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <Icon name="add_circle" className="text-[18px]" />
              <span>Kreiraj nalog</span>
            </Link>
            <button
              type="button"
              disabled
              title="Uskoro"
              className="flex size-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface opacity-60"
            >
              <Icon name="chat" className="text-[18px]" />
            </button>
            <button
              type="button"
              disabled
              title="Uskoro"
              className="flex size-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant opacity-60"
            >
              <Icon name="more_vert" className="text-[18px]" />
            </button>
          </>
        )}
        {action.kind === "respond" &&
          (action.canRespond ? (
            <>
              <button
                type="button"
                disabled={props.respondingId === card.id}
                onClick={() => props.onRespond(card.id, "odbijeno")}
                className="rounded-lg bg-surface-container-highest px-4 py-2.5 font-title-sm text-title-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim disabled:opacity-60"
              >
                Odbij
              </button>
              <button
                type="button"
                disabled={props.respondingId === card.id}
                onClick={() => props.onRespond(card.id, "prihvaceno")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 font-title-sm text-title-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
              >
                <Icon name="check" className="text-[18px]" />
                <span>Prihvati partnerstvo</span>
              </button>
            </>
          ) : (
            <span className="flex-1 rounded-lg bg-surface-container-low px-3 py-2.5 text-center font-title-sm text-title-sm text-on-surface-variant">
              Čeka odgovor partnera
            </span>
          ))}
        {action.kind === "send" &&
          (action.disabledReason ? (
            <span className="flex-1 rounded-lg bg-surface-container-low px-3 py-2.5 text-center font-title-sm text-title-sm text-on-surface-variant">
              {action.disabledReason}
            </span>
          ) : (
            <button
              type="button"
              disabled={props.sendingId === card.id}
              onClick={() => props.onSendRequest(card.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 font-title-sm text-title-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
            >
              <Icon name="person_add" className="text-[18px]" />
              <span>Pošalji zahtev</span>
            </button>
          ))}
        {action.kind === "status" && (
          <span className="flex-1 rounded-lg bg-surface-container-low px-3 py-2.5 text-center font-title-sm text-title-sm text-on-surface-variant">
            {card.statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function ConnectionsView(props: ConnectionsViewProps) {
  const { kpis, isLoading, errorMessage } = props;
  const cardProps = {
    onRespond: props.onRespond,
    respondingId: props.respondingId,
    onSendRequest: props.onSendRequest,
    sendingId: props.sendingId,
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <Link href="/dashboard" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Icon name="home" className="text-[16px]" />
            <span>Početna</span>
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="font-semibold text-on-surface">Veze</span>
        </div>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">Povezane laboratorije i saradnici</h1>
            <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
              Upravljajte partnerstvima sa zubotehničkim laboratorijama, šaljite zahteve za povezivanje i proširite mrežu saradnika za brzu
              razmenu digitalnih otisaka i naloga.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              disabled
              title="Uskoro"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 font-title-sm text-title-sm text-on-surface shadow-sm transition-all hover:bg-surface-container disabled:opacity-60"
            >
              <Icon name="file_upload" className="text-[18px] text-secondary" />
              <span>Uvezi kontakte</span>
            </button>
            <button
              type="button"
              onClick={() => props.onTabChange("find")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-title-sm text-title-sm text-on-primary shadow-sm transition-all hover:bg-primary-container"
            >
              <Icon name="person_add" className="text-[18px]" />
              <span>Pronađi novu {props.counterpartLabel}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Aktivna partnerstva"
          icon="handshake"
          iconBox="bg-primary-fixed text-on-primary-fixed"
          footer={
            <div className={KPI_FOOTER}>
              <span className="inline-flex items-center text-[12px] font-semibold text-primary">
                <Icon name="trending_up" className="mr-0.5 text-[14px]" />+{kpis.newThisMonth} nova
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">ovog kalendarskog meseca</span>
            </div>
          }
        >
          <span className={KPI_VALUE}>{kpis.active}</span>
        </KpiCard>
        <KpiCard
          label="Zahtevi na čekanju"
          icon="pending_actions"
          iconBox="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={
            <div className={`${KPI_FOOTER} justify-between font-body-sm text-body-sm text-on-surface-variant`}>
              <span className="flex items-center gap-1.5 font-medium text-tertiary">
                <span className="size-1.5 rounded-full bg-tertiary" />
                {kpis.received} primljena
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-secondary" />
                {kpis.sent} poslat
              </span>
            </div>
          }
        >
          <span className={KPI_VALUE}>{kpis.pending}</span>
        </KpiCard>
        <KpiCard
          label="Prosečan odziv partnera"
          icon="speed"
          iconBox="bg-surface-container-high text-secondary"
          footer={
            <div className={KPI_FOOTER}>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Vreme prihvatanja digitalnog naloga</span>
            </div>
          }
        >
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display-lg text-display-lg font-bold text-on-surface">{kpis.responseTime?.value ?? "—"}</span>
            {kpis.responseTime && (
              <span className="font-title-sm text-title-sm font-semibold text-on-surface-variant">{kpis.responseTime.unit}</span>
            )}
          </div>
        </KpiCard>
        <KpiCard
          label="Preporučene laboratorije"
          icon="explore"
          iconBox="bg-surface-variant text-on-surface-variant"
          footer={
            <div className={KPI_FOOTER}>
              <span className="font-body-sm text-body-sm text-on-surface-variant">U krugu 25 km • Brzi kurirski prijem</span>
            </div>
          }
        >
          <span className={KPI_VALUE}>{kpis.recommended}</span>
        </KpiCard>
      </div>

      <div className="mb-6 flex max-w-full items-center gap-2 self-start overflow-x-auto rounded-xl bg-surface-container-low/60 p-1.5">
        {props.tabs.map((tab) => {
          const active = tab.value === props.activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => props.onTabChange(tab.value)}
              aria-pressed={active}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 font-title-sm text-title-sm transition-colors ${
                active
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-lowest/50 hover:text-on-surface"
              }`}
            >
              {tab.value === "find" && <Icon name="travel_explore" className="text-[16px]" />}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 font-data-mono text-[11px] font-bold ${
                    tab.highlight && tab.count > 0
                      ? "animate-pulse bg-error text-on-error"
                      : active
                        ? "bg-primary-fixed text-on-primary-fixed"
                        : "bg-surface-variant font-semibold text-on-surface-variant"
                  }`}
                >
                  {tab.highlight && tab.count > 0 ? `${tab.count} nova` : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-[280px] flex-1">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
          <input
            type="search"
            aria-label="Pretraga partnera"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Pretraži po nazivu laboratorije, gradu, tehnologiji (npr. CAD/CAM, 3D Print, keramika)..."
            className="w-full rounded-lg bg-surface-container-low py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MOCK_FILTERS.map((options) => (
            <div key={options[0]} className="relative" title="Uskoro">
              <select disabled aria-label={options[0]} className={DISABLED_SELECT}>
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <Icon name="arrow_drop_down" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
            </div>
          ))}
          <button
            type="button"
            disabled
            title="Uskoro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-2.5 font-label-md text-label-md text-on-surface-variant opacity-60"
          >
            <Icon name="sort" className="text-[18px]" />
            <span>Uspešnost radova</span>
          </button>
        </div>
      </div>

      {errorMessage && <p className="mb-4 text-error">{errorMessage}</p>}
      {isLoading && <p className="mb-4 text-on-surface-variant">Učitavanje...</p>}
      {!isLoading && props.cards.length === 0 && (
        <div className="mb-6 rounded-xl bg-surface-container-lowest p-8 text-center font-body-md text-body-md text-on-surface-variant shadow-sm">
          Nema rezultata u ovoj kategoriji
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {props.cards.map((card) => (
          <PartnerCardView key={card.id} card={card} {...cardProps} />
        ))}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-surface-container to-surface-container-high p-6 md:col-span-2 xl:col-span-2">
          <div className="relative z-10 max-w-xl">
            <span className="rounded-full bg-primary-fixed px-2.5 py-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-primary-fixed">
              Mreža Zubotehničara
            </span>
            <h3 className="mt-3 font-headline-md text-headline-md font-bold text-on-surface">Želite povezivanje sa direktnim kurirskim rutama?</h3>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Povežite se sa laboratorijama u istom regionu za preuzimanje otisaka istog dana, automatsku sinhronizaciju digitalnih
              cenovnika i standardizovane STL protokole.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                disabled
                title="Uskoro"
                className="rounded-lg bg-primary px-4 py-2.5 font-title-sm text-title-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
              >
                Istraži mapu laboratorija u blizini
              </button>
              <button
                type="button"
                disabled
                title="Uskoro"
                className="rounded-lg bg-surface-container-lowest px-4 py-2.5 font-title-sm text-title-sm font-semibold text-on-surface transition-colors disabled:opacity-60"
              >
                Pošalji pozivnicu ordinacije
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-2 right-4 hidden opacity-15 lg:block">
            <svg className="text-primary" fill="none" height="180" viewBox="0 0 200 160" width="220" aria-hidden="true">
              <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="4" />
              <circle cx="160" cy="40" r="28" stroke="currentColor" strokeWidth="4" />
              <circle cx="100" cy="120" r="32" stroke="currentColor" strokeWidth="4" />
              <line stroke="currentColor" strokeDasharray="4 4" strokeWidth="3" x1="62" x2="132" y1="40" y2="40" />
              <line stroke="currentColor" strokeWidth="3" x1="56" x2="80" y1="58" y2="100" />
              <line stroke="currentColor" strokeWidth="3" x1="142" x2="120" y1="62" y2="98" />
            </svg>
          </div>
        </div>
      </div>

      {props.showPending && (
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-2 pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-error-container font-bold text-on-error-container">
                <Icon name="notification_important" className="text-[18px]" />
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Zahtevi za povezivanje na čekanju</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Laboratorije koje traže pristup kreiranju naloga i saradnji sa Vašom ordinacijom.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-error-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-error-container">
              {props.pendingRequests.length} {props.pendingRequests.length === 1 ? "nov zahtev" : "nova zahteva"}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {props.pendingRequests.length === 0 && (
              <p className="rounded-xl bg-surface-container-low p-4 font-body-md text-body-md text-on-surface-variant">
                Trenutno nema primljenih zahteva.
              </p>
            )}
            {props.pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-low p-4 transition-colors hover:bg-surface-container lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-variant font-bold text-primary">
                    <Icon name={request.icon} className="text-[24px]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-title-md text-title-md font-bold text-on-surface">{request.name}</h4>
                      <span className="rounded bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm text-on-surface">
                        {request.address}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">• primljeno {request.receivedAgo}</span>
                    </div>
                    <p className="mt-1 font-body-md text-body-md text-on-surface-variant">&quot;{request.quote}&quot;</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 font-body-sm text-body-sm text-on-surface">
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <Icon name="person" className="text-[16px] text-secondary" />
                        {request.contactPerson}
                      </span>
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <Icon name="phone" className="text-[16px] text-secondary" />
                        {request.phone}
                      </span>
                      <span title="Uskoro" className="flex items-center gap-0.5 font-semibold text-primary opacity-60">
                        Pregledaj ponuđeni cenovnik
                        <Icon name="open_in_new" className="text-[14px]" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end lg:self-center">
                  <button
                    type="button"
                    disabled={props.respondingId === request.id}
                    onClick={() => props.onRespond(request.id, "odbijeno")}
                    className="rounded-lg bg-surface-container-highest px-4 py-2 font-title-sm text-title-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim disabled:opacity-60"
                  >
                    Odbij
                  </button>
                  <button
                    type="button"
                    disabled={props.respondingId === request.id}
                    onClick={() => props.onRespond(request.id, "prihvaceno")}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-title-sm text-title-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
                  >
                    <Icon name="check" className="text-[18px]" />
                    <span>Prihvati partnerstvo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
