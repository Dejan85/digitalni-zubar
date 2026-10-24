import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { shortId } from "@/lib/format";
import type { AlertItem, DashboardData, RecentFilter, RecentRow } from "@/lib/dashboard";

interface DashboardViewProps {
  companyName?: string;
  isDoctor: boolean;
  canCreateOrder: boolean;
  timeLabel: string;
  data: DashboardData | null;
  isPartial: boolean; // brojke su računate nad uzorkom (backend vraća najviše 100 po stranici)
  recentFilter: RecentFilter;
  onRecentFilterChange: (filter: RecentFilter) => void;
  isLoading: boolean;
  errorMessage?: string;
}

// markup je prenet iz dizajn/code.html (iste Tailwind klase); podaci stižu gotovi iz lib/dashboard.ts

const KPI_STYLE = [
  { icon: "bg-surface-container-low text-primary", unit: "text-primary", footer: "bg-surface-container-low/40" },
  { icon: "bg-surface-container text-tertiary", unit: "text-secondary", footer: "bg-surface-container/30" },
  { icon: "bg-surface-container-low text-primary", unit: "text-on-surface-variant", footer: "bg-surface-container-low/40" },
  { icon: "bg-surface-container text-tertiary-container", unit: "text-tertiary", footer: "bg-surface-container/30" },
];

function Kpi({ item, index }: { item: DashboardData["kpis"][number]; index: number }) {
  const style = KPI_STYLE[index % KPI_STYLE.length];
  const card = (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            {item.label}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="tnum font-display-lg text-display-lg font-bold leading-none text-on-surface">
              {item.value}
            </span>
            <span className={`font-data-mono text-label-sm font-semibold ${style.unit}`}>{item.unit}</span>
          </div>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon name={item.icon} className="text-[24px]" />
        </div>
      </div>
      <div className={`-mx-5 -mb-5 mt-4 flex items-center justify-between px-5 py-2.5 pt-3 ${style.footer}`}>
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {index === 0 && <Icon name="trending_up" className="text-[16px] text-primary" />}
          {item.isAttention && <span className="size-2 animate-pulse rounded-full bg-tertiary" />}
          {item.footerLeft}
        </span>
        {item.footerRight && (
          <span className="font-data-mono text-label-sm text-on-surface-variant">{item.footerRight}</span>
        )}
      </div>
    </div>
  );
  return item.href ? (
    <Link href={item.href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

function WeekStrip({ data }: { data: DashboardData }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3">
      <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-on-surface-variant">
        <span>Tekuća radna sedmica</span>
        <span className="font-data-mono font-medium text-primary">Nedelja {data.weekNumber}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {data.weekDays.map((day) => {
          const box = day.isToday
            ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary-fixed"
            : day.isWeekend
              ? "bg-surface-container-lowest/40 text-on-surface-variant opacity-70"
              : day.isPast
                ? "bg-surface-container-lowest/60 text-on-surface-variant"
                : "bg-surface-container-lowest text-on-surface";
          return (
            <div key={day.key} className={`flex flex-col items-center rounded-lg px-1 py-2 ${box}`}>
              <span
                className={`font-label-sm text-label-sm uppercase ${day.isToday ? "font-bold tracking-wider text-primary-fixed" : ""}`}
              >
                {day.isToday ? "Danas" : day.weekday}
              </span>
              <span className={`tnum mt-0.5 font-title-sm text-title-sm ${day.isToday ? "font-bold" : ""}`}>{day.day}</span>
              <div className="mt-1.5 flex h-1.5 items-center gap-0.5">
                {Array.from({ length: day.dots }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${day.isToday ? "bg-primary-fixed" : "bg-primary"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeadlinesPanel({ data }: { data: DashboardData }) {
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name="calendar_clock" className="text-[20px]" />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Rokovi isporuke</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Narednih 14 dana • Praćenje termina pacijenata
            </p>
          </div>
        </div>
        <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-data-mono text-label-sm font-semibold text-on-surface">
          {data.monthLabel}
        </span>
      </div>

      <WeekStrip data={data} />

      <div className="flex flex-col gap-space-sm">
        {data.deadlineGroups.length === 0 && (
          <p className="rounded-xl bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface-variant">
            Nijedna aktivna porudžbina nema rok u narednih 14 dana.
          </p>
        )}
        {data.deadlineGroups.map((group, index) => {
          const dot =
            group.tone === "today"
              ? "h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20"
              : group.tone === "soon"
                ? "h-2.5 w-2.5 rounded-full bg-tertiary"
                : "h-2.5 w-2.5 rounded-full bg-outline-variant";
          const count =
            group.tone === "today"
              ? "rounded-full bg-primary-fixed/40 px-2 py-0.5 font-label-sm text-label-sm font-bold text-primary"
              : group.tone === "soon"
                ? "font-label-sm text-label-sm text-on-surface-variant"
                : "font-label-sm text-label-sm font-semibold text-tertiary-container";
          return (
            <div key={group.key} className={`flex flex-col gap-2 ${index > 0 ? "pt-2" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={dot} />
                  <span className="font-title-sm text-title-sm font-semibold text-on-surface">{group.title}</span>
                </div>
                <span className={count}>{group.countLabel}</span>
              </div>
              {group.tone === "later" ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon name="calendar_view_week" className="text-[20px] text-on-surface-variant" />
                    <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                      {group.items.map((i) => `${i.patientName} (#${shortId(i.id)})`).join(", ")}
                    </span>
                  </div>
                  <Link
                    href={group.items.length === 1 ? `/orders/${group.items[0].id}` : "/orders"}
                    className="font-title-sm text-title-sm text-primary hover:underline"
                  >
                    Detalji
                  </Link>
                </div>
              ) : (
                group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/orders/${item.id}`}
                    className="flex items-start justify-between gap-2 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm transition-colors hover:bg-surface-container-low"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="tnum flex h-8 min-w-8 items-center justify-center rounded-lg bg-surface-container px-1.5 font-data-mono text-label-sm font-bold text-primary">
                        #{shortId(item.id)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-title-sm text-title-sm font-semibold text-on-surface">
                          {item.patientName}
                        </h4>
                        <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                          {item.counterpartName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={item.statusLabel} tone={item.statusTone} />
                  </Link>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ACTION_STYLE: Record<RecentRow["action"]["kind"], string> = {
  details:
    "rounded bg-surface-container px-2.5 py-1 font-title-sm text-title-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high",
  review:
    "rounded bg-surface-container px-2.5 py-1 font-title-sm text-title-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high",
  track:
    "inline-flex items-center gap-1 rounded bg-primary-fixed px-2.5 py-1 font-title-sm text-title-sm font-medium text-on-primary-fixed transition-colors hover:bg-primary-fixed-dim",
  rework:
    "rounded bg-error/10 px-2.5 py-1 font-title-sm text-title-sm font-semibold text-error transition-colors hover:bg-error/20",
};

function RecentOrdersPanel({
  data,
  isDoctor,
  canCreateOrder,
  recentFilter,
  onRecentFilterChange,
}: Pick<DashboardViewProps, "isDoctor" | "canCreateOrder" | "recentFilter" | "onRecentFilterChange"> & {
  data: DashboardData;
}) {
  const rows = data.recentRows[recentFilter];
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-7">
      <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
            <Icon name="assignment" className="text-[20px]" />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Poslednje porudžbine</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Aktivni statusi protetskih radova u toku</p>
          </div>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 font-title-sm text-title-sm font-semibold text-primary hover:text-primary-container"
        >
          <span>Pregledaj sve</span>
          <Icon name="chevron_right" className="text-[16px]" />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-label-sm" role="tablist" aria-label="Filter po statusu">
        {data.recentFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={f.key === recentFilter}
            onClick={() => onRecentFilterChange(f.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 transition-colors ${
              f.key === recentFilter
                ? "bg-primary font-semibold text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/60 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="rounded-l-lg px-3 py-3">ID / Pacijent</th>
              <th className="px-3 py-3">{isDoctor ? "Protetičar" : "Ordinacija"}</th>
              <th className="px-3 py-3">Rok</th>
              <th className="px-3 py-3">Status</th>
              <th className="rounded-r-lg px-3 py-3 text-right">Akcija</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {rows.map((row) => {
              const idColor =
                row.action.kind === "rework"
                  ? "text-error"
                  : row.action.kind === "review"
                    ? "text-on-surface-variant"
                    : "text-primary";
              const hintColor =
                row.deadlineTone === "overdue"
                  ? "text-error font-semibold"
                  : row.deadlineTone === "soon"
                    ? "text-primary font-bold"
                    : "text-on-surface-variant";
              return (
                <tr key={row.id} className="transition-colors hover:bg-surface-container-low/40">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`tnum font-data-mono text-label-sm font-bold ${idColor}`}>#{shortId(row.id)}</span>
                      <span className="font-title-sm text-title-sm font-semibold text-on-surface">{row.patientName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-surface-container text-label-sm font-bold text-tertiary">
                        {row.counterpartInitials}
                      </div>
                      <span className="max-w-[120px] truncate font-body-md text-body-md font-medium text-on-surface">
                        {row.counterpartName}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col">
                      <span
                        className={`font-title-sm text-title-sm font-medium ${row.deadlineTone === "overdue" ? "text-error" : "text-on-surface"}`}
                      >
                        {row.deadline}
                      </span>
                      {row.deadlineHint && (
                        <span className={`font-label-sm text-label-sm ${hintColor}`}>{row.deadlineHint}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusBadge label={row.statusLabel} tone={row.statusTone} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <Link href={`/orders/${row.id}`} className={ACTION_STYLE[row.action.kind]}>
                      {row.action.kind === "track" && <Icon name="local_shipping" className="mr-1 align-middle text-[14px]" />}
                      {row.action.label}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">
            Nijedna porudžbina ne odgovara izabranom filteru.
          </p>
        )}
      </div>

      {canCreateOrder && (
        <div className="mt-auto flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-low p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm">
              <Icon name="cloud_upload" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm font-semibold text-on-surface">
                Brzo slanje intraoralnog skena (.STL / .PLY)
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Direktna distribucija partnerskim laboratorijama bez posrednika
              </p>
            </div>
          </div>
          <Link
            href="/orders/new"
            className="whitespace-nowrap rounded-lg bg-surface-container-lowest px-3.5 py-1.5 text-center font-title-sm text-title-sm font-semibold text-primary shadow-sm transition-all hover:bg-surface-container"
          >
            Nova porudžbina
          </Link>
        </div>
      )}
    </div>
  );
}

const ALERT_CARD: Record<AlertItem["kind"], { card: string; badge: string; icon: string }> = {
  urgent: {
    card: "bg-error-container/40",
    badge: "bg-error text-on-error",
    icon: "warning",
  },
  info: {
    card: "bg-surface-container",
    badge: "bg-tertiary-fixed text-on-tertiary-fixed",
    icon: "check_circle",
  },
  rework: {
    card: "bg-surface-container-high",
    badge: "bg-secondary text-on-secondary",
    icon: "build",
  },
};

type AlertTab = "all" | "deadlines" | "lab" | "patients";
const ALERT_TABS: { key: AlertTab; label: string; kinds: AlertItem["kind"][] }[] = [
  { key: "all", label: "Svi alarmi", kinds: ["urgent", "info", "rework"] },
  { key: "deadlines", label: "Rokovi", kinds: ["urgent"] },
  { key: "lab", label: "Laboratorija", kinds: ["info", "rework"] },
  { key: "patients", label: "Pacijenti", kinds: [] },
];

function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  const [tab, setTab] = useState<AlertTab>("all");
  const kinds = ALERT_TABS.find((t) => t.key === tab)?.kinds ?? [];
  const visible = alerts.filter((a) => kinds.includes(a.kind));
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name="notifications_active" className="text-[20px]" />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Podsetnici i alarmi</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Kritične tačke u protokolu komunikacije sa laboratorijama
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="hidden rounded-lg bg-surface-container p-1 text-label-sm sm:inline-flex" role="tablist">
            {ALERT_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={t.key === tab}
                onClick={() => setTab(t.key)}
                className={`rounded px-2.5 py-1 ${
                  t.key === tab
                    ? "bg-surface-container-lowest font-semibold text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.label}
                {t.key === "all" ? ` (${alerts.length})` : ""}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled
            title="Uskoro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5 font-title-sm text-title-sm font-semibold text-on-surface opacity-60"
          >
            <Icon name="add_alarm" className="text-[18px]" />
            <span>Dodaj ručni podsetnik</span>
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface-container-low p-4 font-body-md text-body-md text-on-surface-variant">
          Nema alarma u ovoj kategoriji.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          {visible.map((alert) => {
            const style = ALERT_CARD[alert.kind];
            return (
              <div key={alert.id} className={`flex flex-col justify-between gap-3 rounded-xl p-4 shadow-sm ${style.card}`}>
                <div className="flex flex-col gap-2">
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-bold uppercase tracking-wider ${style.badge}`}
                  >
                    <Icon name={style.icon} className="text-[13px]" />
                    {alert.badge}
                  </span>
                  <div>
                    <h3 className="font-title-sm text-title-sm font-bold text-on-surface">{alert.title}</h3>
                    <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{alert.text}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={alert.href}
                    className="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-title-sm text-title-sm font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container"
                  >
                    Otvori rad
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// samo izgled kontrolne table (markup iz dizajn/code.html); sve brojke i tekstovi stižu gotovi kroz props
export function DashboardView(props: DashboardViewProps) {
  const { data, isLoading, errorMessage } = props;
  return (
    <div className="flex w-full flex-col gap-space-lg">
      <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <span className="rounded bg-surface-container px-2 py-0.5 font-data-mono text-label-sm uppercase tracking-widest text-primary">
              {props.isDoctor ? "Dental clinic ops" : "Dental lab ops"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
            <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">
              Sistem ažuran • {props.timeLabel}
            </span>
          </div>
          <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-on-surface">Kontrolna tabla</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {props.companyName ? `Dobrodošli nazad, ${props.companyName}` : "Dobrodošli nazad"} • Pregled aktivnih
            protetskih radova, rokova i laboratorija
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container p-1 shadow-sm">
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 py-1.5 text-primary shadow-sm">
              <Icon name={props.isDoctor ? "stethoscope" : "precision_manufacturing"} className="text-[18px]" />
              <span className="font-title-sm text-title-sm">
                {props.isDoctor ? "Doktor (Ordinacija)" : "Protetičar (Laboratorija)"}
              </span>
            </div>
            <button
              type="button"
              disabled
              title="Uskoro"
              className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-on-surface-variant opacity-60"
            >
              <Icon
                name={props.isDoctor ? "precision_manufacturing" : "stethoscope"}
                className="text-[18px] text-on-surface-variant"
              />
              <span className="whitespace-nowrap font-label-md text-label-md font-medium">
                {props.isDoctor ? "Pregledaj kao Protetičar" : "Pregledaj kao Doktor"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              disabled
              title="Uskoro"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3.5 py-2 font-title-sm text-title-sm text-on-surface opacity-60 shadow-sm"
            >
              <Icon name="summarize" className="text-[18px] text-on-surface-variant" />
              <span>Izveštaj</span>
            </button>
            {props.canCreateOrder && (
              <Link
                href="/orders/new"
                className="inline-flex transform items-center gap-2 rounded-lg bg-primary px-4 py-2 font-title-sm text-title-sm text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span className="font-semibold">+ Nova porudžbina</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="text-error">
          {errorMessage}
        </p>
      )}
      {isLoading && <p className="text-on-surface-variant">Učitavanje...</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi, index) => (
              <Kpi key={kpi.label} item={kpi} index={index} />
            ))}
          </div>
          {props.isPartial && (
            <p className="-mt-3 font-label-sm text-label-sm text-on-surface-variant">
              Brojke su računate nad poslednjih 100 porudžbina.
            </p>
          )}
          <div className="grid grid-cols-1 items-start gap-space-md lg:grid-cols-12">
            <DeadlinesPanel data={data} />
            <RecentOrdersPanel
              data={data}
              isDoctor={props.isDoctor}
              canCreateOrder={props.canCreateOrder}
              recentFilter={props.recentFilter}
              onRecentFilterChange={props.onRecentFilterChange}
            />
          </div>
          <AlertsPanel alerts={data.alerts} />
        </>
      )}
    </div>
  );
}
