import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  AgeGroup,
  GenderFilter,
  PatientRow,
  PatientsKpis,
  ProstheticsFilter,
} from "@/lib/patients-list";
import { pageNumbers } from "@/lib/pagination";
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS, PROSTHETICS_OPTIONS } from "@/lib/patients-list";

// markup je prenet iz dizajn/pacijenti i medicinski kartoni/code.html (iste Tailwind klase); podaci i filteri stižu gotovi kroz props

interface PatientsListProps {
  rows: PatientRow[]; // samo redovi tekuće strane
  kpis: PatientsKpis;
  search: string;
  onSearchChange: (value: string) => void;
  gender: GenderFilter;
  onGenderChange: (value: GenderFilter) => void;
  prosthetics: ProstheticsFilter;
  onProstheticsChange: (value: ProstheticsFilter) => void;
  ageGroup: AgeGroup;
  onAgeGroupChange: (value: AgeGroup) => void;
  hasFilters: boolean;
  onResetFilters: () => void;
  onExportCsv: () => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  newOrderHref: (patientId: string) => string;
  isPartial: boolean; // brojevi naloga računati nad najviše 100 porudžbina
  totalRows: number; // filtrirano, svih strana
  rangeFrom: number;
  rangeTo: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  errorMessage?: string;
  // drawer (forma) i potvrda brisanja dolaze iz containera
  children?: ReactNode;
}

const AVATAR_TONES = [
  "bg-primary-container text-on-primary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-error-container text-on-error-container",
  "bg-surface-container-high text-on-surface",
  "bg-primary-fixed text-on-primary-fixed",
];

const FILTER_SELECT =
  "appearance-none cursor-pointer rounded-xl bg-surface-container-low py-2 pl-3 pr-8 font-title-sm text-title-sm text-on-surface outline-none transition-colors hover:bg-surface-container";

const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary";

const HEAD = "px-4 py-3 font-semibold";

function KpiCard(props: {
  label: string;
  value: string;
  valueClass: string;
  icon: string;
  iconClass: string;
  blobClass: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            {props.label}
          </span>
          <span className={`tnum mt-1 font-display-lg text-display-lg ${props.valueClass}`}>{props.value}</span>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${props.iconClass}`}>
          <Icon name={props.icon} className="text-[22px]" />
        </div>
      </div>
      {props.children}
      <div className={`pointer-events-none absolute -bottom-3 -right-3 size-16 rounded-full ${props.blobClass}`} />
    </div>
  );
}

function FilterSelect<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative">
      <select
        aria-label={props.label}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
        className={FILTER_SELECT}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
      />
    </div>
  );
}

export function PatientsList(props: PatientsListProps) {
  const { rows, kpis, isLoading, errorMessage } = props;

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            <Link href="/dashboard" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="home" className="text-[15px]" />
              <span>Početna</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-primary">Pacijenti</span>
          </div>
          <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-on-surface">
            Pacijenti i medicinski kartoni
          </h1>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Evidencija pacijenata ordinacije, povezani protetski radovi, istorija otisaka i specifikacija.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onExportCsv}
            disabled={props.totalRows === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2.5 font-title-sm text-title-sm text-on-surface shadow-sm transition-all hover:bg-surface-container-high disabled:opacity-60"
          >
            <Icon name="file_download" className="text-[18px] text-secondary" />
            <span>Izvezi u Excel / PDF</span>
          </button>
          <button
            type="button"
            onClick={props.onCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-title-sm text-title-sm text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
          >
            <Icon name="person_add" className="text-[20px]" />
            <span>+ Dodaj novog pacijenta</span>
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ukupno registrovanih"
          value={String(kpis.total)}
          valueClass="text-on-surface"
          icon="group"
          iconClass="bg-surface-container text-primary"
          blobClass="bg-primary/5"
        >
          <div className="mt-4 flex items-center gap-1.5 font-label-md text-label-md text-primary">
            <Icon name="trending_up" className="text-[16px]" />
            <span className="font-semibold">+{kpis.newThisMonth} ovog meseca</span>
            {kpis.newThisMonthPercent !== null && (
              <span className="text-body-sm font-normal text-on-surface-variant">
                (+{String(kpis.newThisMonthPercent).replace(".", ",")}%)
              </span>
            )}
          </div>
        </KpiCard>
        <KpiCard
          label="Aktivni protetski radovi"
          value={String(kpis.activeWorks)}
          valueClass="text-tertiary"
          icon="precision_manufacturing"
          iconClass="bg-tertiary-fixed text-on-tertiary-fixed"
          blobClass="bg-tertiary/5"
        >
          <div className="mt-4 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span className="size-2 animate-pulse rounded-full bg-tertiary" />
            <span>{kpis.inLab} u zubotehničkoj laboratoriji</span>
          </div>
        </KpiCard>
        <KpiCard
          label="Čeka probu / predaju"
          value={String(kpis.waitingHandover)}
          valueClass="text-primary-container"
          icon="event_available"
          iconClass="bg-primary-fixed text-on-primary-fixed"
          blobClass="bg-primary-fixed/30"
        >
          <div className="mt-4 flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
            <Icon name="schedule" className="text-[16px] text-primary" />
            <span className="font-medium text-on-surface">{kpis.dueThisWeek} zakazano za ovu nedelju</span>
          </div>
        </KpiCard>
        <KpiCard
          label="Arhivirani kartoni"
          value="325" /* MOCK: domen nema arhivu kartona */
          valueClass="text-secondary"
          icon="folder_special"
          iconClass="bg-surface-container-high text-secondary"
          blobClass="bg-surface-container-high/40"
        >
          <div className="mt-4 flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
            <Icon name="inventory" className="text-[16px] text-secondary" />
            <span>Istorijski podaci dostupni</span>
          </div>
        </KpiCard>
      </div>

      <div className="mb-4 flex flex-col items-stretch justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-[280px] flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="search"
            aria-label="Pretraga pacijenata"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Pretraga po imenu, prezimenu, JMBG ili broju kartona (npr. #JP-882)..."
            className="w-full rounded-xl bg-surface-container-low py-2.5 pl-11 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Pol" value={props.gender} options={GENDER_OPTIONS} onChange={props.onGenderChange} />
          <FilterSelect
            label="Status protetike"
            value={props.prosthetics}
            options={PROSTHETICS_OPTIONS}
            onChange={props.onProstheticsChange}
          />
          <FilterSelect
            label="Starosna grupa"
            value={props.ageGroup}
            options={AGE_GROUP_OPTIONS}
            onChange={props.onAgeGroupChange}
          />
          {props.hasFilters && (
            <button
              type="button"
              onClick={props.onResetFilters}
              className="rounded-xl px-3 py-2 font-title-sm text-title-sm text-primary transition-colors hover:bg-surface-container"
            >
              Resetuj filtere
            </button>
          )}
          <div className="flex items-center rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              title="Tabelarni prikaz"
              aria-label="Tabelarni prikaz"
              className="flex size-8 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm"
            >
              <Icon name="format_list_bulleted" className="text-[18px]" />
            </button>
            <button
              type="button"
              disabled
              title="Uskoro"
              aria-label="Prikaz kartica (uskoro)"
              className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant opacity-60"
            >
              <Icon name="grid_view" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {props.isPartial && (
        <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant">
          Broj naloga i status računati su nad poslednjih 100 porudžbina.
        </p>
      )}

      <div className="mb-6 flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/80 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className={HEAD}>Pacijent</th>
                <th className={HEAD}>Karton</th>
                <th className={HEAD}>Kontakt podaci</th>
                <th className={HEAD}>Aktivni radovi (Laboratorija)</th>
                <th className={`${HEAD} text-center`}>Ukupno naloga</th>
                <th className={HEAD}>Poslednji unos</th>
                <th className={`${HEAD} text-right`}>Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 font-body-md text-body-md text-on-surface">
              {errorMessage && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-error">
                    {errorMessage}
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-on-surface-variant">
                    Učitavanje...
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">
                    Nema pacijenata. Dodaj prvog pacijenta ili promeni filtere.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-container-low/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full font-title-sm text-title-sm font-bold ${AVATAR_TONES[row.avatarTone % AVATAR_TONES.length]}`}
                      >
                        {row.initials}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <Link
                          href={`/patients/${row.id}`}
                          className="truncate font-title-sm text-title-sm text-on-surface hover:text-primary"
                        >
                          {row.fullName}
                        </Link>
                        <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                          <span>{row.genderLetter}</span>
                          <span>•</span>
                          <span>{row.ageText}</span>
                          <span>•</span>
                          <span className="font-data-mono text-data-mono" title="MOCK: JMBG nije u bazi">
                            {row.mock.jmbg}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-md bg-surface-container px-2 py-0.5 font-data-mono text-data-mono font-medium text-on-surface"
                      title="MOCK: broj kartona nije u bazi"
                    >
                      {row.mock.recordNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-body-sm">
                      <a
                        href={row.mock.phoneHref}
                        className="flex items-center gap-1 font-medium text-on-surface transition-colors hover:text-primary"
                      >
                        <Icon name="phone" className="text-[14px] text-on-surface-variant" />
                        {row.mock.phone}
                      </a>
                      <span className="max-w-[160px] truncate text-on-surface-variant">{row.mock.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.work ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-title-sm text-title-sm text-on-surface">
                            {row.work.orderLabel}
                          </span>
                          <StatusBadge label={row.work.statusLabel} tone={row.work.statusTone} />
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{row.work.description}</span>
                      </div>
                    ) : (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Nema naloga</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-surface-container px-2 py-0.5 font-title-sm text-title-sm text-on-surface">
                      {row.ordersCountText}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                    {row.lastEntry}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" disabled title="Uskoro" aria-label="Brzi pregled (uskoro)" className={`${ICON_BUTTON} opacity-60`}>
                        <Icon name="visibility" className="text-[18px]" />
                      </button>
                      <Link
                        href={`/patients/${row.id}`}
                        title="Otvori karton pacijenta"
                        aria-label={`Otvori karton: ${row.fullName}`}
                        className={ICON_BUTTON}
                      >
                        <Icon name="clinical_notes" className="text-[18px]" />
                      </Link>
                      <button
                        type="button"
                        title="Izmeni pacijenta"
                        aria-label={`Izmeni pacijenta: ${row.fullName}`}
                        onClick={() => props.onEdit(row.id)}
                        className={ICON_BUTTON}
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        title="Obriši pacijenta"
                        aria-label={`Obriši pacijenta: ${row.fullName}`}
                        onClick={() => props.onDelete(row.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                      <Link
                        href={props.newOrderHref(row.id)}
                        title="Kreiraj novu protetsku porudžbinu"
                        className="flex items-center gap-1 rounded-lg bg-surface-container px-2 py-1 font-title-sm text-title-sm text-primary transition-colors hover:bg-primary hover:text-on-primary"
                      >
                        <Icon name="add_circle" className="text-[16px]" />
                        <span>Rad</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 bg-surface-container-low/40 px-6 py-4 sm:flex-row">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Prikazano{" "}
            <span className="font-semibold text-on-surface">
              {props.rangeFrom} - {props.rangeTo}
            </span>{" "}
            od <span className="font-semibold text-on-surface">{props.totalRows}</span> pacijenata
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Prethodna strana"
              disabled={props.page <= 1}
              onClick={() => props.onPageChange(props.page - 1)}
              className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-40"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            {pageNumbers(props.page, props.totalPages).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1 text-on-surface-variant">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => props.onPageChange(p)}
                  aria-current={p === props.page ? "page" : undefined}
                  className={
                    p === props.page
                      ? "flex size-8 items-center justify-center rounded-lg bg-primary font-title-sm text-title-sm font-semibold text-on-primary shadow-sm"
                      : "flex size-8 items-center justify-center rounded-lg font-title-sm text-title-sm text-on-surface transition-colors hover:bg-surface-container"
                  }
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Sledeća strana"
              disabled={props.page >= props.totalPages}
              onClick={() => props.onPageChange(props.page + 1)}
              className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-40"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: "biotech",
            iconClass: "bg-tertiary-fixed text-on-tertiary-fixed",
            title: "Integracija sa STL skenerom",
            text: "Automatsko povezivanje digitalnih intraoralnih skenova direktno uz karton.",
          },
          {
            icon: "verified_user",
            iconClass: "bg-primary-fixed text-on-primary-fixed",
            title: "GDPR & Medicinski podaci",
            text: "Šifrovano čuvanje JMBG-a i anamneza pacijenata po standardima zdravstva RS.",
          },
          {
            icon: "history_edu",
            iconClass: "bg-surface-container-high text-on-surface",
            title: "Garantni listovi i protetika",
            text: "Direktna generacija sertifikata materijala i fabričkih kodova iz laboratorije.",
          },
        ].map((card) => (
          <div key={card.title} className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
              <Icon name={card.icon} className="text-[24px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-sm text-title-sm font-semibold text-on-surface">{card.title}</span>
              <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{card.text}</span>
            </div>
          </div>
        ))}
      </div>

      {props.children}
    </div>
  );
}
