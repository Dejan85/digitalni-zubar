import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import {
  MOCK_ODONTOGRAM,
  MOCK_PATIENT_ALERTS,
  MOCK_PATIENT_CERTIFICATES,
  MOCK_PATIENT_DOCTOR,
  MOCK_PATIENT_KPI,
  MOCK_PATIENT_SCANS,
  MOCK_PATIENT_TAB_COUNTS,
  MOCK_PATIENT_WORK,
} from "@/lib/orders-mock";
import type { PatientDetailData } from "@/lib/patient-detail";

// markup je prenet iz dizajn/detalji pacijenta/code.html (iste Tailwind klase); sve što backend nema stiže iz lib/orders-mock.ts

export interface NoteRow {
  id: string;
  text: string;
}

interface PatientDetailProps {
  data?: PatientDetailData;
  notes: NoteRow[]; // stvarne beleške pacijenta; bez njih se prikazuje tekst iz dizajna
  doctorName: string;
  doctorInitials: string;
  newOrderHref: string;
  orderHref: (id: string) => string;
  onEdit: () => void;
  onAddNote: () => void;
  isLoading: boolean;
  errorMessage?: string;
  // drawer izmene i modal beleške dolaze iz containera
  children?: ReactNode;
}

const TOOTH_CLASSES = {
  default: "p-1 rounded bg-surface-container text-on-surface-variant",
  active: "p-1 rounded bg-primary-fixed text-on-primary-fixed font-bold shadow-xs relative",
  finished: "p-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold",
  implant: "p-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold",
};

const LEGEND_CLASSES = {
  active: "bg-primary-fixed",
  finished: "bg-secondary-fixed",
  implant: "bg-tertiary-fixed",
  healthy: "bg-surface-container",
};

const ALERT_CLASSES = {
  allergy:
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold shadow-sm",
  warning:
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shadow-sm",
  info: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium",
};

const ALERT_ICON_CLASSES = { allergy: "", warning: "text-[14px] text-secondary", info: "text-[14px] text-primary" };

const TAB_BASE =
  "px-space-md py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-title-sm text-title-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors shadow-sm";

function OdontogramRow({ teeth }: { teeth: string[] }) {
  return (
    <div className="grid gap-0.5 text-center font-data-mono text-[10px] select-none">
      {teeth.map((tooth) => {
        const mark = MOCK_ODONTOGRAM.states[tooth];
        return (
          <div key={tooth} className={TOOTH_CLASSES[mark?.state ?? "default"]} title={mark?.title}>
            {tooth}
            {mark?.state === "active" && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error"></span>}
          </div>
        );
      })}
    </div>
  );
}

export function PatientDetail(props: PatientDetailProps) {
  const { data } = props;
  if (props.isLoading) return <p className="text-muted">Učitavanje...</p>;
  if (props.errorMessage || !data) return <p className="text-danger">{props.errorMessage}</p>;

  const order = data.activeOrder;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* BREADCRUMB & CONTEXT NAV */}
      <nav className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link className="hover:text-primary transition-colors flex items-center gap-1.5" href="/patients">
            <Icon name="groups" className="text-[18px]" />
            <span>Pacijenti</span>
          </Link>
          <Icon name="chevron_right" className="text-[16px] text-outline-variant" />
          <span className="text-on-surface font-semibold flex items-center gap-1.5">
            <span>{data.fullName}</span>
            <span className="font-data-mono text-data-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
              {data.recordNumber}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Sistem sinhronizovan sa ordinacijom
          </span>
          <span className="text-outline-variant">•</span>
          <span className="font-data-mono text-data-mono">Zadnje ažuriranje: {data.lastUpdated}</span>
        </div>
      </nav>

      {/* PATIENT HERO HEADER */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-24 w-64 h-64 rounded-full bg-secondary-container/30 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-space-md">
          <div className="flex flex-wrap lg:flex-nowrap items-start justify-between gap-space-md">
            <div className="flex items-start gap-space-md min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md shadow-md ring-4 ring-surface-container-lowest">
                  {data.initials}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary ring-2 ring-surface-container-lowest shadow-sm"
                  title="Aktivan pacijent"
                >
                  <Icon name="check" className="text-[14px]" />
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{data.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase font-bold tracking-wider">
                    Aktivan pacijent
                  </span>
                  <span className="font-data-mono text-data-mono text-on-surface-variant font-semibold">
                    ID: {data.recordNumber}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="flex items-center gap-1">
                    <Icon name={data.genderIcon} className="text-[16px] text-primary" />
                    {data.demographics}
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="flex items-center gap-1 font-data-mono">
                    <Icon name="badge" className="text-[16px] text-on-surface-variant" />
                    JMBG: {data.jmbg}
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="flex items-center gap-1">
                    <Icon name="health_and_safety" className="text-[16px] text-tertiary" />
                    RFZO br: {data.rfzo}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 pt-2 text-on-surface font-title-sm text-title-sm">
                  <a className="inline-flex items-center gap-1.5 hover:text-primary transition-colors" href={data.phoneHref}>
                    <Icon name="call" className="text-[18px] text-primary-container" />
                    <span className="font-data-mono">{data.phone}</span>
                  </a>
                  <a className="inline-flex items-center gap-1.5 hover:text-primary transition-colors" href={`mailto:${data.email}`}>
                    <Icon name="mail" className="text-[18px] text-primary-container" />
                    <span>{data.email}</span>
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                    <Icon name="location_on" className="text-[18px] text-outline" />
                    <span>{data.address}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start flex-wrap lg:flex-nowrap">
              <button
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-sm text-title-sm transition-colors shadow-sm"
                type="button"
                onClick={props.onEdit}
              >
                <Icon name="edit" className="text-[18px] text-primary" />
                <span>Izmeni podatke</span>
              </button>
              <button
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-sm text-title-sm transition-colors shadow-sm"
                type="button"
                title="Uskoro"
              >
                <Icon name="picture_as_pdf" className="text-[18px] text-tertiary" />
                <span>Izvezi karton (PDF)</span>
              </button>
              <Link
                className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm font-semibold transition-all shadow-md hover:shadow-lg"
                href={props.newOrderHref}
              >
                <Icon name="note_add" className="text-[20px]" />
                <span>Novi protetski nalog</span>
              </Link>
            </div>
          </div>
          {/* MEDICAL ALERTS / BADGE STRIP */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm uppercase font-bold tracking-wider mr-1">
                <Icon name="warning" className="text-[16px] text-error" />
                <span>Medicinska upozorenja:</span>
              </div>
              {MOCK_PATIENT_ALERTS.map((alert) => (
                <div key={alert.text} className={ALERT_CLASSES[alert.kind]}>
                  {alert.icon ? (
                    <Icon name={alert.icon} className={ALERT_ICON_CLASSES[alert.kind]} />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                  )}
                  <span>{alert.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT KPI OVERVIEW METRICS (BENTO 4 COLS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Protetski radovi
              </span>
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">{data.ordersText}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center">
              <Icon name="precision_manufacturing" className="text-[24px]" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="inline-flex items-center gap-1 text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {data.inProgressCount} u izradi
            </span>
            <span>•</span>
            <span>{data.completedText}</span>
            <span>•</span>
            <span className="text-error font-medium">{data.reworkCount} dorada</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Ukupna vrednost protetike
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold font-data-mono">
                  {MOCK_PATIENT_KPI.totalValue}
                </span>
                <span className="font-title-sm text-title-sm text-on-surface-variant font-semibold">RSD</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-high text-tertiary flex items-center justify-center">
              <Icon name="payments" className="text-[24px]" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="text-primary font-semibold flex items-center gap-1">
              <Icon name="check_circle" className="text-[14px]" /> {MOCK_PATIENT_KPI.paidText}
            </span>
            <span className="font-data-mono">{MOCK_PATIENT_KPI.invoicesText}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Primarna laboratorija
              </span>
              <span className="font-title-md text-title-md text-on-surface font-bold mt-1 truncate">{data.labName}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{MOCK_PATIENT_KPI.labCity}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
              <Icon name="hub" className="text-[24px]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="font-medium">{MOCK_PATIENT_KPI.labSla}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Poslednja intervencija
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                {data.lastInterventionDate}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{MOCK_PATIENT_KPI.lastIntervention}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
              <Icon name="event_available" className="text-[24px]" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 text-on-surface-variant font-label-sm text-label-sm">
            <span>Sledeći termin:</span>
            <span className="font-bold text-primary">{MOCK_PATIENT_KPI.nextAppointment}</span>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-title-sm text-title-sm font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm"
          type="button"
        >
          <Icon name="inventory_2" className="text-[18px]" />
          <span>Protetski radovi i nalozi</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest text-primary font-bold text-label-sm">
            {data.activeOrder ? data.history.length + 1 : data.history.length}
          </span>
        </button>
        <button className={TAB_BASE} type="button" title="Uskoro">
          <Icon name="view_in_ar" className="text-[18px]" />
          <span>3D STL Skenovi i Digitalni otisci</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-label-sm">
            {MOCK_PATIENT_TAB_COUNTS.scans}
          </span>
        </button>
        <button className={TAB_BASE} type="button" title="Uskoro">
          <Icon name="grid_4x4" className="text-[18px]" />
          <span>Zubni status i Odontogram</span>
        </button>
        <button className={TAB_BASE} type="button" title="Uskoro">
          <Icon name="clinical_notes" className="text-[18px]" />
          <span>Medicinska anamneza</span>
        </button>
        <button className={TAB_BASE} type="button" title="Uskoro">
          <Icon name="verified" className="text-[18px]" />
          <span>Garantni listovi i sertifikati</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-label-sm">
            {MOCK_PATIENT_TAB_COUNTS.certificates}
          </span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID (8 Cols Content / 4 Cols Side Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* CURRENT ACTIVE PROSTHETIC WORK ORDER */}
          {order ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
              <div className="flex flex-wrap items-start justify-between gap-space-sm pt-1">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <Icon name="auto_read_play" className="text-[22px]" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm uppercase font-bold text-primary tracking-wider">
                        Aktivni radni nalog
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-data-mono font-bold text-label-sm">
                        {order.label}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-0.5">{order.title}</h2>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  <span>{order.statusText}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-space-md rounded-xl bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">Zubi (FDI)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {MOCK_PATIENT_WORK.teeth.map((tooth) => (
                      <span key={tooth} className="px-2 py-0.5 rounded bg-surface-container-lowest font-data-mono font-bold text-on-surface">
                        {tooth}
                      </span>
                    ))}
                    <span className="text-body-sm text-on-surface-variant font-medium">{MOCK_PATIENT_WORK.teethLabel}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">
                    Nijansa (Shade)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: MOCK_PATIENT_WORK.shadeColor }}></span>
                    <span className="font-title-sm text-title-sm font-bold text-on-surface">{MOCK_PATIENT_WORK.shade}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{MOCK_PATIENT_WORK.bleach}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">Partner Lab</span>
                  <div className="flex items-center gap-1 mt-1 font-title-sm text-title-sm text-on-surface font-semibold truncate">
                    <Icon name="store" className="text-[16px] text-tertiary" />
                    <span className="truncate">{order.partnerName}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">Rok isporuke</span>
                  <div className="flex items-center gap-1.5 mt-1 font-title-sm text-title-sm text-error font-bold">
                    <Icon name="timer" className="text-[16px]" />
                    <span>{order.deadlineText}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant font-semibold uppercase tracking-wider">
                    Status izrade u laboratoriji (Faza {order.phase} od 5)
                  </span>
                  <span className="font-data-mono font-bold text-primary">{order.percent}% Završeno</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {MOCK_PATIENT_WORK.steps.map((title, index) =>
                    index < order.stepsDone ? (
                      <div key={title} className="h-2 rounded-full bg-primary" title={title}></div>
                    ) : index === order.stepsDone ? (
                      <div key={title} className="h-2 rounded-full bg-primary relative overflow-hidden" title={title}>
                        <div className="absolute inset-0 bg-primary-fixed-dim animate-pulse"></div>
                      </div>
                    ) : (
                      <div key={title} className="h-2 rounded-full bg-surface-container-high" title={title}></div>
                    ),
                  )}
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                  <span>{order.startedText}</span>
                  <span className="text-primary font-medium">{MOCK_PATIENT_WORK.technician}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-sm text-title-sm transition-colors"
                    type="button"
                    title="Uskoro"
                  >
                    <Icon name="chat" className="text-[18px] text-tertiary" />
                    <span>{MOCK_PATIENT_WORK.messagesLabel}</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-sm text-title-sm transition-colors"
                    type="button"
                    title="Uskoro"
                  >
                    <Icon name="description" className="text-[18px] text-outline" />
                    <span>Preuzmi radni nalog (.PDF)</span>
                  </button>
                </div>
                <Link
                  className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary-container font-title-sm text-title-sm font-semibold hover:bg-primary transition-colors"
                  href={props.orderHref(order.id)}
                >
                  <span>Detalji naloga {order.label}</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg text-on-surface-variant font-body-md text-body-md">
              Pacijent nema aktivnih radnih naloga.
            </div>
          )}

          {/* ARHIVA PRETHODNIH NALOGA */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="history_edu" className="text-primary text-[22px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                  Istorijat završenih protetskih naloga
                </h3>
              </div>
              <span className="text-on-surface-variant font-label-md text-label-md">{data.historyCountText}</span>
            </div>
            <div className="flex flex-col gap-3">
              {data.history.map((row) => (
                <div
                  key={row.id}
                  className="p-space-md rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="check_circle" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-title-sm text-title-sm text-on-surface font-bold">{row.label}</span>
                        <span className="text-outline-variant">•</span>
                        <span className="font-title-sm text-title-sm text-on-surface font-semibold truncate">{row.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-label-sm font-bold">
                          ZAVRŠENO
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                        {row.teeth && (
                          <>
                            <span>
                              Zubi: <strong className="text-on-surface font-data-mono">{row.teeth}</strong>
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{row.extra}</span>
                        <span>•</span>
                        <span>
                          Završeno: <strong>{row.completedText}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <span className="font-data-mono font-bold text-on-surface text-title-sm mr-2">{row.price} RSD</span>
                    <button
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors"
                      title="Preuzmi garantni sertifikat"
                      type="button"
                    >
                      <Icon name="verified" className="text-[18px] text-tertiary" />
                    </button>
                    <Link
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-title-sm text-title-sm font-semibold transition-colors"
                      href={props.orderHref(row.id)}
                    >
                      Pregled
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIGITAL 3D SCANS & INTRAORAL LIBRARY */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="view_in_ar" className="text-primary text-[22px]" />
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Biblioteka digitalnih 3D otisaka</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sirovi intraoralni STL/PLY fajlovi spremni za CAD/CAM laboratorijsku obradu
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-sm text-title-sm transition-colors"
                type="button"
                title="Uskoro"
              >
                <Icon name="upload_file" className="text-[18px] text-primary" />
                <span>Uvezi novi 3D sken</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {MOCK_PATIENT_SCANS.featured.map((scan) => (
                <div
                  key={scan.title}
                  className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between gap-space-sm group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold uppercase tracking-wider ${
                            scan.primary
                              ? "bg-primary-fixed text-on-primary-fixed"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {scan.badge}
                        </span>
                        <span className="font-data-mono text-label-sm text-on-surface-variant">{scan.size}</span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold mt-1.5">{scan.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{scan.subtitle}</p>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center ${
                        scan.primary ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      <Icon name={scan.icon} className="text-[18px]" />
                    </span>
                  </div>
                  <div className="h-32 rounded-lg bg-surface-container-highest relative flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-300"
                      data-alt={scan.imageAlt}
                      alt=""
                      src={scan.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="font-data-mono text-label-sm text-surface-bright font-medium flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${scan.dotClass}`}></span> .STL Format
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-bold">
                        {scan.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      className={`flex-1 py-2 rounded-lg font-title-sm text-title-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        scan.primary
                          ? "bg-primary text-on-primary hover:bg-primary-container shadow-sm"
                          : "bg-surface-container-lowest hover:bg-surface-container text-on-surface"
                      }`}
                      type="button"
                      title="Uskoro"
                    >
                      <Icon name="3d_rotation" className="text-[18px]" />
                      <span>{scan.viewLabel}</span>
                    </button>
                    <button
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors"
                      title="Preuzmi STL fajl"
                      type="button"
                    >
                      <Icon name="download" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
              {MOCK_PATIENT_SCANS.files.map((file) => (
                <div key={file.title} className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0 ${file.iconClass}`}
                    >
                      <Icon name={file.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">{file.title}</span>
                      <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                        <span className="font-data-mono">{file.size}</span>
                        <span>•</span>
                        <span className={file.metaClass}>{file.meta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors"
                      title="Pregled"
                      type="button"
                    >
                      <Icon name="visibility" className="text-[18px]" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors"
                      title="Preuzmi"
                      type="button"
                    >
                      <Icon name="download" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN / SIDE PANEL */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* INTERACTIVE ODONTOGRAM MINI-MAP */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="grid_goldenratio" className="text-primary text-[20px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Status odontograma</h3>
              </div>
              <a className="text-primary hover:text-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1" href="#">
                <span>Uredi zubni status</span>
                <Icon name="open_in_new" className="text-[14px]" />
              </a>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
              FDI numeracija. Kliknite na zub za istorijat zahvata i laboratorijskih faza.
            </p>
            <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-center">
                  Gornja vilica (Maksila)
                </span>
                <OdontogramRow teeth={MOCK_ODONTOGRAM.upper} />
              </div>
              <div className="h-px bg-surface-variant relative flex items-center justify-center">
                <span className="px-2 bg-surface-container-low font-data-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
                  Središnja linija
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <OdontogramRow teeth={MOCK_ODONTOGRAM.lower} />
                <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-center mt-0.5">
                  Donja vilica (Mandibula)
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-on-surface-variant font-label-sm text-label-sm pt-1">
              {MOCK_ODONTOGRAM.legend.map((item) => (
                <div key={item.state} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${LEGEND_CLASSES[item.state]}`}></span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GUARANTEE CERTIFICATES & MATERIAL PASSPORT */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="verified_user" className="text-tertiary text-[22px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Izdati garantni listovi</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                2 Pasoša
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_PATIENT_CERTIFICATES.map((cert) => (
                <div key={cert.title} className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-title-sm text-title-sm text-on-surface font-bold">{cert.title}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{cert.subtitle}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                      Aktivno
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-surface-container font-data-mono text-[11px] text-on-surface-variant">
                    <span>{cert.serial}</span>
                    <a className="text-tertiary hover:underline font-semibold flex items-center gap-0.5" href="#">
                      <span>PDF Sertifikat</span>
                      <Icon name="download" className="text-[13px]" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RESPONSIBLE CLINICIAN & CLINICAL NOTES */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <Icon name="stethoscope" className="text-primary text-[20px]" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Nadležni stomatolog</h3>
            </div>
            <div className="flex items-center gap-3 p-space-sm rounded-xl bg-surface-container-low">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm flex-shrink-0">
                {props.doctorInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface font-bold truncate">{props.doctorName}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{MOCK_PATIENT_DOCTOR.specialty}</span>
                <span className="font-data-mono text-label-sm text-primary font-medium mt-0.5">{MOCK_PATIENT_DOCTOR.license}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">
                Napomena za sledeću posetu ({MOCK_PATIENT_DOCTOR.visitDate}):
              </span>
              <div className="p-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm flex flex-col gap-1">
                {(props.notes.length > 0 ? props.notes.map((note) => note.text) : MOCK_PATIENT_DOCTOR.notes).map((text, index) => (
                  <p key={props.notes[index]?.id ?? text}>
                    {index + 1}. {text}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Interna ordinacijska arhiva</span>
              <button
                className="text-primary hover:text-primary-container font-title-sm text-title-sm font-semibold flex items-center gap-1"
                type="button"
                onClick={props.onAddNote}
              >
                <Icon name="add_comment" className="text-[16px]" />
                <span>Dodaj belešku</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
}
