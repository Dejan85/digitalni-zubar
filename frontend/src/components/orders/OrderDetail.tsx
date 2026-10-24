import Link from "next/link";
import type { ChangeEvent, ComponentProps, FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/lib/order-status";
import type { TimelinePhase } from "@/lib/order-timeline";

import { ImpressionUpload } from "./ImpressionUpload";

// markup je prenet iz dizajn/porudzbina/code.html (iste Tailwind klase); podaci stižu gotovi kroz props.
// Polja označena MOCK u containeru nemaju podlogu u backendu (documentation/REDIZAJN_MOCK.md).

export interface OrderItemRow {
  id: string;
  description: string;
  detail: string;
  chips: { icon: string; text: string }[];
  fdi: string;
  shade: { label: string; color: string } | null;
  shadeLabel: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface ImpressionRow {
  id: string;
  isDigital: boolean;
  typeLabel: string;
  detail: string;
}

export interface OrderNoteRow {
  id: string;
  text: string;
  date: string;
  isAutomatic: boolean;
}

export interface StatusAction {
  status: string;
  label: string;
  isDestructive: boolean;
}

interface PartyInfo {
  name: string;
  address: string;
  contactName: string;
  phone: string;
}

interface OrderDetailProps {
  shortId: string;
  patient: {
    name: string;
    recordNumber: string;
    ageText: string;
    birthDate: string;
    genderLabel: string;
    jmbg: string;
    allergies: string;
  };
  statusLabel?: string;
  statusTone?: StatusTone;
  isUrgent: boolean;
  deadline: string;
  deadlineHint: string;
  createdAt: string;
  fdiList: string[];
  courier: string;
  clinic: PartyInfo & { license: string };
  lab: PartyInfo & { isVerified: boolean };
  items: OrderItemRow[];
  total: string;
  impressions: ImpressionRow[];
  impressionUpload: ComponentProps<typeof ImpressionUpload>;
  timeline: { phases: TimelinePhase[]; progress: string };
  notes: OrderNoteRow[];
  noteField: UseFormRegisterReturn;
  noteError?: string;
  isAddingNote: boolean;
  onAddNote: FormEventHandler<HTMLFormElement>;
  actions: StatusAction[];
  needsDeadline: boolean;
  deadlineValue: string;
  onDeadlineChange: (value: string) => void;
  actionError?: string;
  isUpdatingStatus: boolean;
  onAction: (status: string) => void;
  rework: {
    isAvailable: boolean;
    reasons: { value: string; label: string }[];
    reason: string;
    onReasonChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    error?: string;
    onSubmit: () => void;
  };
}

const ACTION_STYLE: Record<string, { icon: string; className: string }> = {
  vracena_na_doradu: {
    icon: "replay",
    className:
      "bg-surface-container-lowest text-amber-700 hover:bg-amber-50 shadow-sm shadow-amber-900/5 px-3.5",
  },
  otkazana: { icon: "cancel", className: "bg-surface-container-lowest text-error hover:bg-error-container/40 shadow-sm px-3.5" },
  odbijena: { icon: "cancel", className: "bg-surface-container-lowest text-error hover:bg-error-container/40 shadow-sm px-3.5" },
  isporucena: { icon: "verified", className: "bg-primary text-on-primary hover:bg-primary-container shadow-sm px-4" },
  potvrdjena: { icon: "task_alt", className: "bg-primary text-on-primary hover:bg-primary-container shadow-sm px-4" },
  u_izradi: { icon: "precision_manufacturing", className: "bg-tertiary text-on-tertiary hover:bg-tertiary-container shadow-sm px-3" },
  poslata: { icon: "local_shipping", className: "bg-tertiary text-on-tertiary hover:bg-tertiary-container shadow-sm px-3" },
};

const ACTION_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 font-title-sm text-title-sm transition-all disabled:opacity-60";

const FIELD =
  "w-full rounded-lg bg-surface-container-low px-2.5 font-body-sm text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest";

const DEADLINE_HINT_TONE = "ml-1 rounded bg-error-container px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-on-error-container";

function Timeline({ phases, progress }: { phases: TimelinePhase[]; progress: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-center justify-between pb-1">
        <h3 className="flex items-center gap-2 font-title-md text-title-md font-bold text-on-surface">
          <Icon name="timeline" className="text-[20px] text-primary" />
          Tok izrade i statusi
        </h3>
        <span className="font-data-mono text-label-sm font-bold text-primary">{progress}</span>
      </div>
      <div className="relative flex flex-col pl-4">
        <div className="absolute bottom-3 left-6 top-3 w-0.5 bg-surface-container-high" />
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;
          const spacing = isLast ? "" : "pb-6";
          if (phase.state === "done") {
            return (
              <div key={phase.title} className={`relative flex items-start gap-4 ${spacing}`}>
                <div className="z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                  <Icon name="check" className="text-[12px] font-bold" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-title-sm text-title-sm font-semibold text-on-surface">{phase.title}</span>
                    {phase.time && <span className="font-data-mono text-[11px] text-on-surface-variant">{phase.time}</span>}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{phase.description}</p>
                </div>
              </div>
            );
          }
          if (phase.state === "current") {
            return (
              <div key={phase.title} className={`relative flex items-start gap-4 ${spacing}`}>
                <div className="z-10 mt-0.5 flex size-5 shrink-0 animate-pulse items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-4 ring-amber-100">
                  <Icon name="precision_manufacturing" className="text-[12px]" />
                </div>
                <div className="flex w-full flex-col rounded-lg border-0 bg-amber-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-title-sm text-title-sm font-bold text-amber-900">{phase.title}</span>
                    <span className="rounded bg-amber-200/80 px-1.5 py-0.5 font-label-sm text-label-sm font-bold uppercase text-amber-900">
                      Sada
                    </span>
                  </div>
                  {phase.time && <span className="mt-0.5 font-data-mono text-[11px] text-amber-800">{phase.time}</span>}
                  <p className="mt-1 font-body-sm text-body-sm text-amber-900/90">{phase.description}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={phase.title} className={`relative flex items-start gap-4 opacity-60 ${spacing}`}>
              <div className="z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                <span className="size-2 rounded-full bg-outline-variant" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-title-sm text-title-sm font-medium text-on-surface">{phase.title}</span>
                  {phase.time && <span className="font-data-mono text-[11px] text-on-surface-variant">{phase.time}</span>}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{phase.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderDetailMessage({ message, isError }: { message: string; isError?: boolean }) {
  return <p className={isError ? "text-error" : "text-on-surface-variant"}>{message}</p>;
}

export function OrderDetail(props: OrderDetailProps) {
  const { patient, clinic, lab, rework } = props;

  return (
    <div className="flex w-full flex-col">
      {/* GLAVNO ZAGLAVLJE PORUDŽBINE */}
      <div className="mb-8 flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link href="/orders" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="inventory_2" className="text-[18px]" />
              <span>Porudžbine</span>
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="font-data-mono font-semibold text-on-surface">#{props.shortId}</span>
            <span className="text-outline-variant">·</span>
            <span className="font-medium text-on-surface">{patient.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            {props.fdiList.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 font-data-mono text-[11px] font-medium text-on-surface-variant">
                <Icon name="tag" className="text-[13px] text-primary" />
                FDI: {props.fdiList.join(", ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="calendar_today" className="text-[14px]" />
              Nalog od: {props.createdAt}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm xl:flex-row xl:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display-lg text-display-lg tracking-tight text-on-surface">
                Porudžbina #{props.shortId}
              </h1>
              {props.statusLabel && props.statusTone && <StatusBadge label={props.statusLabel} tone={props.statusTone} />}
              {props.isUrgent && (
                <div className="inline-flex items-center gap-1 rounded-full bg-error px-2.5 py-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-error shadow-sm">
                  <Icon name="bolt" className="text-[14px]" />
                  <span>HITNO</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body-md text-body-md text-on-surface-variant">
              <div className={`flex items-center gap-1.5 ${props.isUrgent ? "font-semibold text-error" : ""}`}>
                <Icon name="alarm" className="text-[18px]" />
                <span>Rok isporuke: {props.deadline}</span>
                {props.deadlineHint && <span className={DEADLINE_HINT_TONE}>({props.deadlineHint})</span>}
              </div>
              <span className="hidden text-outline-variant sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Icon name="local_shipping" className="text-[16px] text-primary" />
                <span>Kurir: {props.courier}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            {props.actions.map((action) => {
              const style = ACTION_STYLE[action.status] ?? ACTION_STYLE.potvrdjena;
              const className = `${ACTION_BASE} ${style.className}`;
              if (action.status === "vracena_na_doradu") {
                return (
                  <a key={action.status} href="#dorada" className={className}>
                    <Icon name={style.icon} className="text-[18px]" />
                    <span>{action.label}</span>
                  </a>
                );
              }
              return (
                <button
                  key={action.status}
                  type="button"
                  disabled={props.isUpdatingStatus}
                  onClick={() => props.onAction(action.status)}
                  className={className}
                >
                  <Icon name={style.icon} className="text-[18px]" />
                  <span>{action.label}</span>
                </button>
              );
            })}
            <div className="hidden items-center gap-2 border-l border-surface-variant/40 pl-2 2xl:flex">
              <button
                type="button"
                disabled
                title="Uskoro"
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-surface-container px-3 py-2 font-title-sm text-title-sm text-on-surface opacity-60"
              >
                <Icon name="download" className="text-[18px]" />
                <span>3D STL (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>

        {props.needsDeadline && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <label htmlFor="deadline" className="font-label-md text-label-md font-semibold text-on-surface">
              Rok isporuke (obavezno za potvrdu)
            </label>
            <input
              id="deadline"
              type="date"
              value={props.deadlineValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => props.onDeadlineChange(e.target.value)}
              className="h-9 rounded-lg bg-surface-container-low px-2.5 font-body-sm text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest"
            />
          </div>
        )}
        {props.actionError && (
          <p role="alert" className="font-label-md text-label-md text-error">
            {props.actionError}
          </p>
        )}
      </div>

      {/* GLAVNI GRID */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* LEVA KOLONA */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          {/* Pacijent i ordinacija */}
          <div className="flex flex-col justify-between gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:flex-row">
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                    <Icon name="person" className="text-[16px]" />
                    Karton Pacijenta
                  </span>
                  <span className="rounded bg-surface-container-high px-2 py-0.5 font-data-mono text-data-mono font-bold text-on-surface">
                    {patient.recordNumber}
                  </span>
                </div>
                <h2 className="mb-1 font-headline-md text-headline-md font-semibold text-on-surface">{patient.name}</h2>
                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                  <span>
                    <strong>{patient.ageText}</strong> ({patient.birthDate})
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span>
                    Pol: <strong>{patient.genderLabel}</strong>
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-data-mono">JMBG: {patient.jmbg}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-surface-container-low p-3">
                <Icon name="health_and_safety" className="mt-0.5 text-[18px] text-primary" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">Alergije i upozorenja</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{patient.allergies}</p>
                </div>
              </div>
            </div>
            <div className="hidden w-px bg-surface-container-high md:block" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
                    <Icon name="domain" className="text-[16px]" />
                    Naručilac / Ordinacija
                  </span>
                  <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
                    Ordinacija
                  </span>
                </div>
                <h3 className="mb-1 font-title-md text-title-md font-semibold text-on-surface">{clinic.name}</h3>
                <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant">{clinic.address}</p>
                <div className="mb-4 flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Icon name="stethoscope" className="text-[16px] text-primary" />
                    <span className="font-medium text-on-surface">{clinic.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="call" className="text-[16px] text-secondary" />
                    <span className="font-data-mono">{clinic.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Licenca: <strong>{clinic.license}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary">
                  <Icon name="verified" className="text-[14px]" />
                  Aktivna saradnja
                </span>
              </div>
            </div>
          </div>

          {/* Laboratorija */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-sm sm:flex-row">
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/10 text-primary">
                <Icon name="precision_manufacturing" className="text-[28px]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-title-md text-title-md font-bold text-on-surface">{lab.name}</h4>
                  {lab.isVerified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-primary-fixed">
                      <Icon name="verified" className="text-[12px]" />
                      Verifikovan Lab
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="location_on" className="text-[14px]" />
                  {lab.address}
                  <span className="text-outline-variant">•</span>
                  Dodeljeni tehničar: <strong className="text-on-surface">{lab.contactName}</strong>
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <button
                type="button"
                disabled
                title="Uskoro"
                className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md font-semibold text-on-surface opacity-60"
              >
                <Icon name="phone" className="text-[16px]" />
                <span>Pozovi Lab</span>
              </button>
              <a
                href="#kanal"
                className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <Icon name="chat" className="text-[16px]" />
                <span>Otvori kanal</span>
              </a>
            </div>
          </div>

          {/* Specifikacija */}
          <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 pb-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Specifikacija protetskog rada</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  FDI stomatološka nomenklatura i tehnički parametri materijala
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1.5">
                <span className="mr-1 font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
                  Fokus zubni niz:
                </span>
                {props.fdiList.map((tooth) => (
                  <span
                    key={tooth}
                    className="flex size-7 items-center justify-center rounded bg-primary font-data-mono text-label-sm font-bold text-on-primary shadow-xs"
                  >
                    {tooth}
                  </span>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-body-md">
                <thead>
                  <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th className="rounded-l-lg px-4 py-3">Opis stavke &amp; detalji konstrukcije</th>
                    <th className="px-3 py-3 text-center">FDI</th>
                    <th className="px-3 py-3 text-center">Boja (VITA)</th>
                    <th className="px-3 py-3 text-center">Količina</th>
                    <th className="px-3 py-3 text-right">Cena (RSD)</th>
                    <th className="rounded-r-lg px-4 py-3 text-right">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {props.items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-surface-container-low/60">
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-title-sm text-title-sm font-bold text-on-surface">{item.description}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</span>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {item.chips.map((chip) => (
                              <span
                                key={chip.text}
                                className="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface"
                              >
                                {chip.icon && <Icon name={chip.icon} className="text-[12px] text-primary" />}
                                {chip.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center align-top">
                        <span className="rounded bg-surface-container-high px-2 py-1 font-data-mono text-data-mono font-bold text-on-surface">
                          {item.fdi}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center align-top">
                        {item.shade ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-data-mono text-label-sm font-bold text-amber-900">
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: item.shade.color }} />
                            {item.shade.label}
                          </span>
                        ) : (
                          <span className="font-data-mono text-label-sm text-on-surface-variant">{item.shadeLabel}</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center align-top font-data-mono font-semibold text-on-surface">
                        {item.quantity} kom
                      </td>
                      <td className="px-3 py-4 text-right align-top font-data-mono text-on-surface-variant">{item.unitPrice}</td>
                      <td className="px-4 py-4 text-right align-top font-data-mono font-bold text-on-surface">{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {props.items.length === 0 && (
                <p className="p-6 text-center font-body-sm text-body-sm text-on-surface-variant">Nema stavki</p>
              )}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-low p-4 pt-4 sm:flex-row">
              <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="receipt_long" className="text-[20px] text-primary" />
                <span>B2B Radni Nalog. Zaduženje se knjiži na zbirnu mesečnu fakturu laboratorije.</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-label-md text-label-md font-semibold uppercase text-on-surface-variant">
                  Ukupno za naplatu:
                </span>
                <span className="font-data-mono text-headline-lg font-bold tracking-tight text-primary">{props.total}</span>
              </div>
            </div>
          </div>

          {/* Otisak */}
          <div className="flex flex-col gap-5 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                  <Icon name="view_in_ar" className="text-[24px]" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Otisak i digitalni 3D modeli</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Direktan intraoralni skener izvoz (Trios 4 Shape / PLY &amp; STL)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  title="Uskoro"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-label-md text-label-md font-semibold text-on-primary opacity-60 shadow-xs"
                >
                  <Icon name="download_for_offline" className="text-[18px]" />
                  <span>Preuzmi sve fajlove (.ZIP)</span>
                </button>
                <button
                  type="button"
                  disabled
                  title="Uskoro"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md font-semibold text-on-surface opacity-60"
                >
                  <Icon name="visibility" className="text-[18px]" />
                  <span>3D WebGL Pregled</span>
                </button>
              </div>
            </div>

            {props.impressions.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low p-4 text-center font-body-sm text-body-sm text-on-surface-variant">
                Nema otisaka
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {props.impressions.map((impression) => (
                  <div
                    key={impression.id}
                    className="group flex items-center justify-between rounded-xl bg-surface-container-low p-3.5 transition-colors hover:bg-surface-container"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Icon
                        name={impression.isDigital ? "data_object" : "inventory"}
                        className={`text-[24px] ${impression.isDigital ? "text-primary" : "text-tertiary"}`}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-title-sm text-title-sm font-semibold text-on-surface">
                          {impression.detail}
                        </span>
                        <span className="font-data-mono text-[11px] text-on-surface-variant">{impression.typeLabel}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      title="Uskoro"
                      aria-label="Preuzmi fajl"
                      className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant opacity-60"
                    >
                      <Icon name="download" className="text-[18px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ImpressionUpload {...props.impressionUpload} />

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="photo_camera" className="text-[16px] text-primary" />
                  Priložene fotografije pacijenta sa ključem boja (VITA shade guide)
                </span>
              </div>
              <div className="flex h-24 items-center justify-center rounded-xl bg-surface-container text-center font-body-sm text-body-sm text-on-surface-variant">
                Fotografije još nisu podržane (Uskoro)
              </div>
            </div>
          </div>
        </div>

        {/* DESNA KOLONA */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <Timeline {...props.timeline} />

          <div
            id="kanal"
            className="flex h-[420px] scroll-mt-24 flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="forum" className="text-[20px] text-primary" />
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Kanal saradnje</h3>
              </div>
              <span className="size-2 rounded-full bg-primary" title="Aktivan kanal" />
            </div>
            <div className="my-3 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {props.notes.length === 0 && (
                <p className="my-auto text-center font-body-sm text-body-sm text-on-surface-variant">Nema beleški</p>
              )}
              {props.notes.map((note) =>
                note.isAutomatic ? (
                  <div key={note.id} className="flex max-w-[88%] flex-col items-start">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface">Sistem</span>
                      <span className="font-data-mono text-[10px] text-on-surface-variant">{note.date}</span>
                    </div>
                    <div className="rounded-xl rounded-tl-none bg-surface-container-low p-3 font-body-sm text-body-sm leading-relaxed text-on-surface">
                      {note.text}
                    </div>
                  </div>
                ) : (
                  <div key={note.id} className="flex max-w-[88%] flex-col items-end self-end">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="font-data-mono text-[10px] text-on-surface-variant">{note.date}</span>
                      <span className="font-label-sm text-label-sm font-bold text-primary">Beleška</span>
                    </div>
                    <div className="rounded-xl rounded-tr-none bg-primary-container p-3 font-body-sm text-body-sm leading-relaxed text-on-primary-container shadow-xs">
                      {note.text}
                    </div>
                  </div>
                ),
              )}
            </div>
            <form
              onSubmit={props.onAddNote}
              noValidate
              className="flex flex-col gap-2 border-t border-surface-container-high/40 pt-2"
            >
              <textarea
                rows={2}
                aria-label="Tekst beleške"
                aria-invalid={!!props.noteError}
                placeholder="Napišite belešku ili uputstvo za laboratoriju..."
                className={`${FIELD} resize-none p-2.5`}
                {...props.noteField}
              />
              {props.noteError && (
                <p role="alert" className="font-label-sm text-label-sm text-error">
                  {props.noteError}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <button type="button" disabled title="Uskoro" aria-label="Priloži fotografiju" className="rounded p-1.5 opacity-60">
                    <Icon name="attach_file" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Uskoro"
                    aria-label="Podesi alarm za termin pacijenta"
                    className="rounded p-1.5 opacity-60"
                  >
                    <Icon name="alarm_add" className="text-[18px]" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={props.isAddingNote}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-label-md text-label-md font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-container disabled:opacity-60"
                >
                  <span>Pošalji poruku</span>
                  <Icon name="send" className="text-[16px]" />
                </button>
              </div>
            </form>
          </div>

          <div id="dorada" className="flex scroll-mt-24 flex-col gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <Icon name="replay_circle_filled" className="text-[20px] text-amber-600" />
              <h4 className="font-title-sm text-title-sm font-bold">Protokol vraćanja na doradu (Remake)</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ukoliko proba u ordinaciji ne zadovoljava, izaberite razlog dorade. Laboratorija automatski dobija reklamacioni
              nalog.
            </p>
            <div className="flex flex-col gap-2.5">
              <div>
                <label
                  htmlFor="rework-reason"
                  className="mb-1 block font-label-sm text-label-sm font-semibold uppercase text-on-surface"
                >
                  Razlog reklamacije / dorade *
                </label>
                <select
                  id="rework-reason"
                  value={rework.reason}
                  onChange={(e) => rework.onReasonChange(e.target.value)}
                  disabled={!rework.isAvailable}
                  className={`${FIELD} h-9 disabled:opacity-60`}
                >
                  <option value="">Odaberite primarni razlog...</option>
                  {rework.reasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="rework-description"
                  className="mb-1 block font-label-sm text-label-sm font-semibold uppercase text-on-surface"
                >
                  Dodatni opis i priložena nova fotografija
                </label>
                <input
                  id="rework-description"
                  type="text"
                  value={rework.description}
                  onChange={(e) => rework.onDescriptionChange(e.target.value)}
                  disabled={!rework.isAvailable}
                  placeholder="Unesite zapažanja nakon probe u ustima..."
                  className={`${FIELD} h-9 disabled:opacity-60`}
                />
              </div>
              {rework.error && (
                <p role="alert" className="font-label-sm text-label-sm text-error">
                  {rework.error}
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled
                  title="Uskoro"
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm font-medium text-on-surface-variant opacity-60"
                >
                  <Icon name="add_a_photo" className="text-[16px]" />
                  <span>Dodaj kontrolnu sliku</span>
                </button>
                <button
                  type="button"
                  disabled={!rework.isAvailable || props.isUpdatingStatus}
                  title={rework.isAvailable ? undefined : "Dorada je moguća samo za poslatu ili isporučenu porudžbinu"}
                  onClick={rework.onSubmit}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 font-label-md text-label-md font-bold text-white shadow-xs transition-colors hover:bg-amber-700 disabled:opacity-60"
                >
                  Vrati u radionicu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
