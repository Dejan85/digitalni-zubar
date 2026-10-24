import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import type { CatalogCategoryChip, CatalogKpis, CatalogRow, CategoryFilter } from "@/lib/services-catalog";
import { MOCK_IMPRESSION_LABELS, type MockImpressionKind } from "@/lib/orders-mock";
import { pageNumbers } from "@/lib/pagination";

// markup je prenet iz dizajn/katalog/code.html (iste Tailwind klase); podaci i filteri stižu gotovi kroz props

export interface TechnicianOption {
  id: string;
  name: string;
}

interface ServicesViewProps {
  rows: CatalogRow[]; // samo redovi tekuće strane
  kpis: CatalogKpis;
  chips: CatalogCategoryChip[];
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  // protetičar upravlja katalogom, doktor ga samo pregleda
  canManage: boolean;
  // super admin upravlja svim katalozima, ali novu uslugu može da doda tek kad izabere laboratoriju
  canCreate: boolean;
  // kolona/oznaka laboratorije i filter (doktor i super admin)
  showTechnician: boolean;
  technicianOptions?: TechnicianOption[];
  technicianFilter: string;
  onTechnicianFilterChange: (value: string) => void;
  connectionsCount: number | null; // null dok se ne učita
  connectionsLabel: string; // "Povezane ordinacije" / "Povezane laboratorije"
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExportCsv: () => void;
  totalRows: number; // filtrirano, svih strana
  rangeFrom: number;
  rangeTo: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  errorMessage?: string;
  // modali (forma / potvrda brisanja) renderuje container
  children?: ReactNode;
}

const HEAD = "px-space-md py-3";

const IMPRESSION_STYLES: Record<MockImpressionKind, { pill: string; dot: string }> = {
  digital: { pill: "bg-surface-container-high text-primary", dot: "bg-primary" },
  cbct: { pill: "bg-surface-container-high text-primary", dot: "bg-primary" },
  analog: { pill: "bg-surface-container text-on-surface-variant", dot: "bg-secondary" },
  both: { pill: "bg-surface-container-low text-on-surface", dot: "bg-tertiary" },
};

const CHIP_ACTIVE = "flex shrink-0 items-center gap-2 rounded-lg bg-primary px-space-md py-2 font-title-sm text-title-sm text-on-primary shadow-sm";
const CHIP_IDLE =
  "flex shrink-0 items-center gap-2 rounded-lg bg-surface-container-low px-space-md py-2 font-title-sm text-title-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface";

function KpiCard(props: { label: string; icon: string; iconClass: string; subClass: string; sub: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{props.label}</span>
        <span className="font-display-lg text-display-lg font-bold leading-tight text-on-surface">{props.children}</span>
        <span className={`mt-1 font-body-sm text-body-sm ${props.subClass}`}>{props.sub}</span>
      </div>
      <div className={`flex size-12 items-center justify-center rounded-xl bg-surface-container-low ${props.iconClass}`}>
        <Icon name={props.icon} className="text-[24px]" />
      </div>
    </div>
  );
}

export function ServicesView(props: ServicesViewProps) {
  const { rows, kpis, isLoading, errorMessage, canManage, showTechnician } = props;
  const colSpan = 6 + (canManage ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-space-lg">
      <div className="flex w-full flex-col justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-space-sm">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container">
            <Icon name="verified" className="text-[20px] text-primary" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-title-sm text-title-sm text-on-surface">Aktuelni B2B cenovnik zubotehničke laboratorije</span>
            <span className="line-clamp-1 font-body-sm text-body-sm text-on-surface-variant">
              Cenovnik važi za sve povezane stomatološke ordinacije. Cene su izražene u RSD bez skrivenih troškova logistike.
            </span>
          </div>
        </div>
        {kpis.updatedAt && (
          <div className="flex shrink-0 items-center gap-space-sm self-start md:self-auto">
            <div className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-space-sm py-1 text-on-surface-variant">
              <span className="size-2 rounded-full bg-primary-container" />
              <span className="font-data-mono text-[11px] text-on-surface-variant">Ažurirano: {kpis.updatedAt}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div className="flex max-w-3xl flex-col gap-1">
          <nav className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            <Link href="/dashboard" className="transition-colors hover:text-on-surface">
              Početna
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="font-bold text-primary">Usluge i cenovnik</span>
          </nav>
          <h1 className="mt-0.5 font-headline-lg text-headline-lg tracking-tight text-on-surface">Katalog protetskih usluga</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Definišite cene, prosečne rokove izrade (radni dani), tipove materijala i zahteve za digitalne/analogne otiske za partnerske
            klinike.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm">
          <button
            type="button"
            disabled
            title="Uskoro"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-space-md py-2.5 font-title-sm text-title-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-low disabled:opacity-60"
          >
            <Icon name="file_upload" className="text-[18px] text-secondary" />
            <span>Uvezi cenovnik (CSV/Excel)</span>
          </button>
          {props.canCreate && (
            <button
              type="button"
              onClick={props.onCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-space-md py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <Icon name="add" className="text-[18px]" />
              <span>Dodaj novu uslugu</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Ukupno usluga" icon="layers" iconClass="text-primary" subClass="font-medium text-primary" sub="Sve aktivne">
          {kpis.total}
        </KpiCard>
        <KpiCard
          label="Prosečan rok izrade"
          icon="timelapse"
          iconClass="text-tertiary"
          subClass="text-secondary"
          sub="Okvirno (nije u bazi)"
        >
          {kpis.averageLeadDays.toLocaleString("sr-Latn-RS")} <span className="text-headline-sm font-normal text-on-surface-variant">dana</span>
        </KpiCard>
        <KpiCard
          label="Digitalni STL radovi"
          icon="view_in_ar"
          iconClass="text-primary"
          subClass="text-primary"
          sub="Okvirno (nije u bazi)"
        >
          {kpis.digitalPercent}%
        </KpiCard>
        <KpiCard label={props.connectionsLabel} icon="domain" iconClass="text-secondary" subClass="text-secondary" sub="Aktivne veze">
          {props.connectionsCount ?? "—"}
        </KpiCard>
      </div>

      <div className="flex flex-col items-center justify-between gap-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm md:flex-row">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 md:w-auto md:pb-0">
          {props.chips.map((chip) => (
            <button
              key={chip.value || "all"}
              type="button"
              onClick={() => props.onCategoryChange(chip.value)}
              aria-pressed={chip.value === props.category}
              className={chip.value === props.category ? CHIP_ACTIVE : CHIP_IDLE}
            >
              <span>{chip.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 font-data-mono text-[11px] ${
                  chip.value === props.category ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {chip.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
          {props.technicianOptions && (
            <div className="relative">
              <select
                aria-label="Filter po laboratoriji"
                value={props.technicianFilter}
                onChange={(e) => props.onTechnicianFilterChange(e.target.value)}
                className="cursor-pointer appearance-none rounded-lg bg-surface-container-low py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface shadow-sm outline-none transition-colors hover:bg-surface-container"
              >
                <option value="">Sve povezane laboratorije</option>
                {props.technicianOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
              />
            </div>
          )}
          <div className="relative w-full md:w-64">
            <Icon name="filter_list" className="pointer-events-none absolute left-3 top-2.5 text-[18px] text-on-surface-variant" />
            <input
              type="text"
              aria-label="Pretraga kataloga"
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder="Pretraži šifru, rad ili materijal..."
              className="w-full rounded-lg bg-surface-container-low py-2 pl-9 pr-3 font-body-sm text-body-sm text-on-surface shadow-sm outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest"
            />
          </div>
          <button
            type="button"
            title="Export tabele (CSV)"
            aria-label="Export tabele (CSV)"
            onClick={props.onExportCsv}
            disabled={props.totalRows === 0}
            className="rounded-lg bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-60"
          >
            <Icon name="download" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="select-none bg-surface-container-low/70 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className={HEAD}>Šifra i naziv usluge</th>
                <th className={HEAD}>Kategorija</th>
                <th className={HEAD}>Cena (RSD)</th>
                <th className={HEAD}>Standardni rok</th>
                <th className={HEAD}>Zahtevani otisak</th>
                <th className={HEAD}>Status</th>
                {canManage && <th className={`${HEAD} text-right`}>Akcije</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-md text-body-md">
              {errorMessage && (
                <tr>
                  <td colSpan={colSpan} className="px-space-md py-6 text-error">
                    {errorMessage}
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={colSpan} className="px-space-md py-6 text-on-surface-variant">
                    Učitavanje...
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && rows.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="px-space-md py-10 text-center text-on-surface-variant">
                    {canManage
                      ? "Nema usluga. Dodaj prvu uslugu u svoj katalog ili promeni filtere."
                      : "Nema usluga. Povezane laboratorije još nemaju usluge u katalogu ili promeni filtere."}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-surface-container-low/40">
                  <td className="min-w-[260px] px-space-md py-3.5">
                    <div className="flex items-start gap-space-sm">
                      <span
                        className="mt-0.5 shrink-0 rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-[11px] font-semibold text-primary"
                        title="MOCK: šifra nije u bazi"
                      >
                        {row.code}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-title-sm text-title-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                          {row.name}
                        </span>
                        <span className="line-clamp-1 font-body-sm text-body-sm text-on-surface-variant" title="MOCK: opis nije u bazi">
                          {row.description}
                        </span>
                        {showTechnician && (
                          <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                            <Icon name="science" className="text-[14px]" />
                            {row.technicianName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-space-md py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${row.categoryBadgeClass}`}
                      title="MOCK: kategorija nije u bazi"
                    >
                      {row.categoryLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-space-md py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-data-mono text-[14px] font-bold text-on-surface">{row.priceValue}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">RSD</span>
                      {canManage && (
                        <button
                          type="button"
                          title="Brza izmena cene"
                          aria-label={`Izmeni cenu: ${row.name}`}
                          onClick={() => props.onEdit(row.id)}
                          className="p-1 text-on-surface-variant opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100"
                        >
                          <Icon name="edit" className="text-[15px]" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-space-md py-3.5">
                    <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface" title="MOCK: rok nije u bazi">
                      <Icon name="schedule" className={`text-[16px] ${row.leadIsFast ? "text-primary" : "text-secondary"}`} />
                      <span>{row.leadText}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-space-md py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${IMPRESSION_STYLES[row.impression].pill}`}
                      title="MOCK: zahtevani otisak nije u bazi"
                    >
                      <span className={`size-1.5 rounded-full ${IMPRESSION_STYLES[row.impression].dot}`} />
                      {MOCK_IMPRESSION_LABELS[row.impression]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-space-md py-3.5">
                    <label className="relative inline-flex items-center" title="Uskoro: deaktivacija usluge">
                      <input type="checkbox" checked disabled readOnly className="peer sr-only" aria-label={`Status: ${row.name}`} />
                      <div className="h-5 w-9 rounded-full bg-primary-container opacity-70 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:translate-x-full after:rounded-full after:bg-surface-container-lowest after:transition-all after:content-['']" />
                      <span className="ml-2 font-label-sm text-label-sm font-medium text-on-surface">Aktivna</span>
                    </label>
                  </td>
                  {canManage && (
                    <td className="whitespace-nowrap px-space-md py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 text-on-surface-variant">
                        <button
                          type="button"
                          title="Izmeni detalje"
                          aria-label={`Izmeni uslugu: ${row.name}`}
                          onClick={() => props.onEdit(row.id)}
                          className="rounded-lg p-1.5 transition-colors hover:bg-surface-container hover:text-primary"
                        >
                          <Icon name="edit_note" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Uskoro: dupliranje usluge"
                          aria-label="Dupliraj uslugu (uskoro)"
                          className="rounded-lg p-1.5 opacity-60 transition-colors"
                        >
                          <Icon name="content_copy" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          title="Obriši uslugu"
                          aria-label={`Obriši uslugu: ${row.name}`}
                          onClick={() => props.onDelete(row.id)}
                          className="rounded-lg p-1.5 transition-colors hover:bg-error-container hover:text-error"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md sm:flex-row">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Prikazano <span className="font-semibold text-on-surface">{rows.length}</span> od{" "}
            <span className="font-semibold text-on-surface">{props.totalRows}</span> stavki cenovnika
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Prethodna strana"
              disabled={props.page <= 1}
              onClick={() => props.onPageChange(props.page - 1)}
              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
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
                      ? "flex size-8 items-center justify-center rounded-lg bg-primary font-label-md text-label-md font-bold text-on-primary"
                      : "flex size-8 items-center justify-center rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container"
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
              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-space-md lg:grid-cols-3">
        {[
          {
            icon: "cloud_sync",
            iconClass: "text-primary",
            title: "Standardi 3D digitalnih otisaka",
            text: (
              <>
                Za digitalne radove prihvatamo otvorene <b>.STL</b>, <b>.PLY</b> i <b>.OBJ</b> fajlove sa svih intraoralnih skenera (Trios,
                Medit, iTero, Carestream). Model se automatski validira pri prijemu.
              </>
            ),
          },
          {
            icon: "local_shipping",
            iconClass: "text-tertiary",
            title: "Kurirska služba i otprema",
            text: "Laboratorija obezbeđuje besplatnu kurirsku dostavu u krugu grada za porudžbine veće od 3 radne jedinice. Analogni otisci se preuzimaju radnim danima do 11:00h.",
          },
          {
            icon: "palette",
            iconClass: "text-secondary",
            title: "Odabir boje i fasetiranje",
            text: "Obavezno navesti VITA Classical ili VITA 3D Master ključ. Za zahtevne estetske radove na prednjim zubima preporučujemo slanje polarizovane fotografije pacijenta.",
          },
        ].map((card) => (
          <div key={card.title} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="flex items-center gap-space-sm">
              <div className={`flex size-8 items-center justify-center rounded-lg bg-surface-container ${card.iconClass}`}>
                <Icon name={card.icon} className="text-[20px]" />
              </div>
              <span className="font-title-sm text-title-sm font-semibold text-on-surface">{card.title}</span>
            </div>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{card.text}</p>
          </div>
        ))}
      </div>
      {props.children}
    </div>
  );
}
