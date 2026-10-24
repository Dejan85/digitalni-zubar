import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DateRange, OrderListRow, OrdersKpi, StatusChip } from "@/lib/orders-list";
import type { OrderStatus } from "@/lib/types";

// markup je prenet iz dizajn/porudzbine/code.html (iste Tailwind klase); podaci i filteri stižu gotovi kroz props

interface OrdersListProps {
  rows: OrderListRow[]; // samo red-ovi tekuće strane
  kpis: OrdersKpi[];
  chips: StatusChip[];
  partners: { id: string; name: string }[];
  partnerLabel: string; // "Laboratorija" / "Ordinacija"
  canCreate: boolean;
  timeLabel: string;
  isPartial: boolean; // lista je računata nad najviše 100 porudžbina
  statusFilter: OrderStatus | "";
  onStatusFilterChange: (value: OrderStatus | "") => void;
  search: string;
  onSearchChange: (value: string) => void;
  partnerId: string;
  onPartnerChange: (value: string) => void;
  dateRange: DateRange;
  dateRangeOptions: { value: DateRange; label: string }[];
  onDateRangeChange: (value: DateRange) => void;
  hasFilters: boolean;
  onResetFilters: () => void;
  onExportCsv: () => void;
  selectedIds: string[];
  allSelected: boolean;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  totalRows: number; // filtrirano, svih strana
  rangeFrom: number;
  rangeTo: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  isLoading: boolean;
  errorMessage?: string;
}

const KPI_TONE: Record<OrdersKpi["tone"], { value: string; hint: string; icon: string }> = {
  primary: { value: "text-on-surface", hint: "text-primary", icon: "bg-primary-fixed/30 text-primary" },
  error: { value: "text-error", hint: "text-error", icon: "bg-error-container/40 text-error" },
  tertiary: { value: "text-tertiary", hint: "text-on-surface-variant", icon: "bg-tertiary-fixed/30 text-tertiary" },
  default: { value: "text-on-surface", hint: "text-on-surface-variant", icon: "bg-surface-container-high text-secondary" },
};

const FILTER_SELECT =
  "appearance-none cursor-pointer rounded-xl bg-surface-container-low py-2 pl-3.5 pr-9 font-title-sm text-title-sm text-on-surface outline-none transition-colors hover:bg-surface-container";

const AVATAR = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  neutral: "bg-surface-container-high text-on-surface-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  error: "bg-error-container text-on-error-container",
};

const HEAD = "whitespace-nowrap px-4 py-3.5 font-semibold";

const DEADLINE_HINT: Record<OrderListRow["deadlineTone"], string> = {
  overdue: "text-error font-semibold",
  soon: "text-error font-semibold",
  done: "text-[#16A34A] font-semibold",
  normal: "text-on-surface-variant",
};

function KpiCard({ kpi }: { kpi: OrdersKpi }) {
  const tone = KPI_TONE[kpi.tone];
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          {kpi.label}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`tnum font-headline-lg text-headline-lg ${tone.value}`}>{kpi.value}</span>
          <span className={`flex items-center font-label-md text-label-md font-medium ${tone.hint}`}>
            {kpi.unitIcon && <Icon name={kpi.unitIcon} className="text-[16px]" />}
            {kpi.unit}
          </span>
        </div>
      </div>
      <div className={`flex size-12 items-center justify-center rounded-xl ${tone.icon}`}>
        <Icon name={kpi.icon} className="text-[24px]" />
      </div>
    </div>
  );
}

function pageNumbers(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

export function OrdersList(props: OrdersListProps) {
  const { rows, isLoading, errorMessage } = props;

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {props.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
              Laboratorijska logistika
            </span>
            <span className="size-1.5 rounded-full bg-outline-variant" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">Ažurirano {props.timeLabel}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">Porudžbine</h1>
          <p className="mt-0.5 font-body-md text-body-md text-on-surface-variant">
            Upravljanje radovima, praćenje faza izrade i direktna komunikacija sa zubotehničarima
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-surface-container p-1 shadow-inner">
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3.5 py-1.5 font-title-sm text-title-sm text-on-surface shadow-sm">
              <Icon name="table_chart" className="text-[18px] text-primary" />
              <span>Tabela</span>
            </div>
            <button
              type="button"
              disabled
              title="Uskoro"
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-title-sm text-title-sm text-on-surface-variant opacity-60"
            >
              <Icon name="view_kanban" className="text-[18px]" />
              <span>Kanban tabla</span>
            </button>
          </div>
          <button
            type="button"
            onClick={props.onExportCsv}
            disabled={props.totalRows === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-4 py-2 font-title-sm text-title-sm text-secondary shadow-sm transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            <Icon name="ios_share" className="text-[18px]" />
            <span>Izvezi CSV</span>
          </button>
          {props.canCreate && (
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              <Icon name="add" className="text-[20px]" />
              <span>Nova porudžbina</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter po statusu">
          {props.chips.map((chip) => {
            const selected = chip.key === props.statusFilter;
            return (
              <button
                key={chip.key || "all"}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => props.onStatusFilterChange(chip.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-label-md text-label-md transition-all ${
                  selected
                    ? "bg-on-surface font-semibold text-surface-container-lowest shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {chip.key && (
                  <span data-status={chip.key} className="size-2 rounded-full bg-(--chip-fg)" aria-hidden="true" />
                )}
                <span>{chip.label}</span>
                <span
                  className={
                    selected
                      ? "tnum rounded-full bg-surface-container-highest px-1.5 text-[11px] font-bold text-on-surface"
                      : "tnum font-data-mono text-[11px] text-on-surface-variant"
                  }
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-stretch justify-between gap-3 pt-2 lg:flex-row lg:items-center">
          <div className="relative min-w-[280px] flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
            />
            <input
              type="search"
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              aria-label="Pretraga porudžbina"
              placeholder={`Pretraži po broju (#), pacijentu, ${props.partnerLabel.toLowerCase()}...`}
              className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={props.partnerId}
                onChange={(e) => props.onPartnerChange(e.target.value)}
                aria-label={props.partnerLabel}
                className={FILTER_SELECT}
              >
                <option value="">{`Svi partneri (${props.partnerLabel.toLowerCase()})`}</option>
                {props.partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Icon
                name="arrow_drop_down"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant"
              />
            </div>
            <div className="relative">
              <select
                value={props.dateRange}
                onChange={(e) => props.onDateRangeChange(e.target.value as DateRange)}
                aria-label="Datum kreiranja"
                className={FILTER_SELECT}
              >
                {props.dateRangeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Icon
                name="calendar_today"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant"
              />
            </div>
            <button
              type="button"
              onClick={props.onResetFilters}
              disabled={!props.hasFilters}
              className="flex items-center gap-1 px-2 py-1.5 font-label-md text-label-md font-semibold text-primary transition-colors hover:text-primary-container disabled:opacity-50"
            >
              <Icon name="restart_alt" className="text-[16px]" />
              <span>Resetuj filtere</span>
            </button>
          </div>
        </div>
      </div>

      {props.isPartial && (
        <p className="-mt-3 mb-4 font-label-sm text-label-sm text-on-surface-variant">
          Lista, brojke i filteri računaju se nad poslednjih 100 porudžbina.
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mb-4 text-error">
          {errorMessage}
        </p>
      )}

      {props.selectedIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-inverse-surface px-4 py-2.5 text-inverse-on-surface shadow-md">
          <span className="flex items-center gap-1.5 font-title-sm text-title-sm font-semibold">
            <Icon name="check_circle" className="text-[20px] text-primary-fixed" />
            <span>
              Odabrano porudžbina: <strong className="font-data-mono">{props.selectedIds.length}</strong>
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Uskoro"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-title-sm text-title-sm text-on-primary opacity-60"
            >
              <Icon name="download" className="text-[16px]" />
              <span>Preuzmi odabrane STL fajlove</span>
            </button>
            <button
              type="button"
              disabled
              title="Uskoro"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-title-sm text-title-sm text-inverse-on-surface opacity-60"
            >
              <Icon name="print" className="text-[16px]" />
              <span>Štampaj radne naloge</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="select-none bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label="Označi sve porudžbine na strani"
                    checked={props.allSelected}
                    onChange={props.onToggleAll}
                    className="size-4 cursor-pointer rounded accent-primary"
                  />
                </th>
                <th className={HEAD}>Br. porudžbine</th>
                <th className={HEAD}>Pacijent</th>
                <th className={HEAD}>Partner / {props.partnerLabel}</th>
                <th className={HEAD}>Usluge & Rad</th>
                <th className={HEAD}>Tip otiska</th>
                <th className={HEAD}>Status</th>
                <th className={HEAD}>Rok isporuke</th>
                <th className={HEAD}>Datum kreiranja</th>
                <th className={`${HEAD} text-right`}>Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`group transition-colors hover:bg-surface-container-low/70 ${row.needsAttention ? "bg-error/5" : ""}`}
                >
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Označi porudžbinu #${row.shortId}`}
                      checked={props.selectedIds.includes(row.id)}
                      onChange={() => props.onToggleRow(row.id)}
                      className="size-4 cursor-pointer rounded accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${row.id}`}
                        className="tnum font-data-mono font-bold text-on-surface transition-colors group-hover:text-primary"
                      >
                        #{row.shortId}
                      </Link>
                      {row.isUrgent && (
                        <span
                          className="inline-flex items-center gap-0.5 rounded bg-error/10 px-1.5 py-0.5 font-label-sm text-[10px] font-bold tracking-tight text-error"
                          title="Rok manji od 48h"
                        >
                          <Icon name="flash_on" className="text-[12px]" /> HITNO
                        </span>
                      )}
                      {row.needsAttention && (
                        <span className="size-2 rounded-full bg-[#EA580C]" title="Zahteva pažnju" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full font-title-sm text-title-sm font-semibold ${AVATAR[row.needsAttention ? "error" : row.mock.avatarTone]}`}
                      >
                        {row.patientInitials}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-title-sm text-title-sm font-semibold">{row.patientName}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{row.mock.patientMeta}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-title-sm text-title-sm font-medium text-on-surface">
                          {row.partnerName}
                        </span>
                        <Icon
                          name="verified"
                          className={`text-[15px] ${row.mock.partnerVerified ? "text-tertiary" : "text-outline"}`}
                        />
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{row.mock.partnerCity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex max-w-[210px] flex-col">
                      <span className="truncate font-title-sm text-title-sm font-medium text-on-surface">
                        {row.mock.service.title}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-data-mono text-[11px] ${row.mock.service.tagTone === "error" ? "text-error" : "text-on-surface-variant"}`}
                      >
                        {row.mock.service.tag && (
                          <span
                            className={`rounded px-1 font-semibold ${row.mock.service.tagTone === "error" ? "bg-error-container" : "bg-surface-container"}`}
                          >
                            {row.mock.service.tag}
                          </span>
                        )}
                        <span>{row.mock.service.detail}</span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {row.mock.impression.kind === "digital" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-tertiary-fixed/30 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed-variant">
                        <Icon name="3d_rotation" className="text-[16px] text-tertiary" />
                        <span>{row.mock.impression.label}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                        <Icon name="inventory" className="text-[16px]" />
                        <span>{row.mock.impression.label}</span>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <StatusBadge label={row.statusLabel} tone={row.statusTone} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex flex-col">
                      <span
                        className={`font-title-sm text-title-sm font-medium ${row.deadlineTone === "overdue" ? "text-error" : ""}`}
                      >
                        {row.deadline}
                      </span>
                      {row.deadlineHint && (
                        <span className={`font-label-sm text-label-sm ${DEADLINE_HINT[row.deadlineTone]}`}>
                          {row.deadlineHint}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{row.createdAt}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/orders/${row.id}`}
                        title="Brzi pregled porudžbine"
                        aria-label={`Pregled porudžbine #${row.shortId}`}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      >
                        <Icon name="visibility" className="text-[19px]" />
                      </Link>
                      {row.needsAttention ? (
                        <Link
                          href={`/orders/${row.id}`}
                          title="Pregled primedbe"
                          aria-label={`Primedba na porudžbinu #${row.shortId}`}
                          className="rounded-lg p-1.5 text-[#EA580C] transition-colors hover:bg-error-container"
                        >
                          <Icon name="priority_high" className="text-[19px]" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Uskoro"
                          aria-label="Chat sa laboratorijom"
                          className="rounded-lg p-1.5 text-on-surface-variant opacity-60"
                        >
                          <Icon
                            name={row.statusTone === "isporucena" ? "receipt_long" : "chat_bubble_outline"}
                            className="text-[19px]"
                          />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled
                        title="Uskoro"
                        aria-label="Više akcija"
                        className="rounded-lg p-1.5 text-on-surface-variant opacity-60"
                      >
                        <Icon name="more_vert" className="text-[19px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <p className="p-8 text-center text-on-surface-variant">Učitavanje...</p>}
          {!isLoading && !errorMessage && rows.length === 0 && (
            <div className="flex flex-col items-center gap-1 p-10 text-center">
              <Icon name="inventory_2" className="text-[32px] text-on-surface-variant" />
              <p className="font-title-sm text-title-sm font-semibold text-on-surface">Nema porudžbina</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {props.hasFilters ? "Nijedna porudžbina ne odgovara izabranim filterima." : "Još nema porudžbina."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 bg-surface-container-low/50 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Prikazano{" "}
              <strong className="font-semibold text-on-surface">
                {props.rangeFrom}-{props.rangeTo}
              </strong>{" "}
              od <strong className="font-semibold text-on-surface">{props.totalRows}</strong> porudžbina
            </span>
            <div className="h-4 w-px bg-surface-variant" />
            <label className="flex items-center gap-1.5">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Po stranici:</span>
              <select
                value={props.pageSize}
                onChange={(e) => props.onPageSizeChange(Number(e.target.value))}
                className="cursor-pointer rounded-lg bg-surface-container-lowest px-2 py-1 font-title-sm text-title-sm text-on-surface outline-none"
              >
                {props.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <nav className="flex select-none items-center gap-1" aria-label="Paginacija">
            <button
              type="button"
              aria-label="Prethodna strana"
              disabled={props.page <= 1}
              onClick={() => props.onPageChange(props.page - 1)}
              className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            {pageNumbers(props.page, props.totalPages).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1 text-on-surface-variant">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-current={p === props.page ? "page" : undefined}
                  onClick={() => props.onPageChange(p)}
                  className={`flex size-8 items-center justify-center rounded-lg font-title-sm text-title-sm ${
                    p === props.page
                      ? "bg-primary font-semibold text-on-primary shadow-sm"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
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
              className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
