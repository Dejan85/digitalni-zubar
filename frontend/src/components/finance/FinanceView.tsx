import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import type { FinanceKpis, Invoice, LabShare, MaterialUsage } from "@/lib/finance-mock";

// markup je prenet iz dizajn/finansije/code.html (iste Tailwind klase); cela stranica je MOCK — vidi lib/finance-mock.ts

interface FinanceViewProps {
  pib: string;
  kpis: FinanceKpis;
  tabs: { label: string; count: string; pill: string }[];
  periods: string[];
  labs: string[];
  statuses: string[];
  invoices: Invoice[];
  invoicesFooter: string;
  materials: MaterialUsage[];
  ips: { invoice: string; recipient: string; account: string; amount: string; reference: string };
  labShares: LabShare[];
  sef: { syncedAgo: string; certificate: string; xml: string };
}

const KPI_CARD = "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group";
const KPI_HEAD = "flex items-center justify-between text-on-surface-variant mb-2";
const KPI_LABEL = "font-label-sm text-label-sm uppercase tracking-wider font-semibold";
const SELECT_BOX = "flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface";
const SELECT = "bg-transparent font-title-sm text-body-sm text-on-surface outline-none cursor-pointer pr-1";
const ICON_BUTTON = "p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";
const ORDER_ID = "px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-data-mono text-[11px] font-semibold";

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const isPending = invoice.status === "pending";
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors bg-surface-container-lowest">
      <td className="py-3.5 px-4 align-top">
        <div className="flex flex-col">
          <span className="font-title-sm text-title-sm text-on-surface font-semibold flex items-center gap-1.5">
            {invoice.number}
            <Icon name="verified" className="text-[15px] text-tertiary" />
          </span>
          <span className="font-data-mono text-[11px] text-on-surface-variant">SEF-ID: {invoice.sefId}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 align-top">
        <div className="flex flex-col">
          <span className="font-title-sm text-body-sm text-on-surface font-semibold">{invoice.lab}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{invoice.labMeta}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 align-top">
        {invoice.summary ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-semibold">
                {invoice.summary.label}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">{invoice.summary.text}</span>
            </div>
            <span className="text-on-surface-variant font-label-sm text-[11px]">{invoice.summary.patients}</span>
          </div>
        ) : (
          <div className={invoice.orders.length > 1 ? "flex flex-col gap-1" : undefined}>
            {invoice.orders.map((order) => (
              <div key={order.id} className="flex items-center gap-1.5">
                <span className={ORDER_ID}>{order.id}</span>
                <span className="font-body-sm text-body-sm text-on-surface">{order.patient}</span>
                <span className="text-on-surface-variant font-label-sm text-[11px]">{order.item}</span>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="py-3.5 px-4 align-top">
        <div className="flex flex-col">
          <span className="font-data-mono text-body-sm text-on-surface">{invoice.issued}</span>
          {invoice.dueLine.tone === "urgent" ? (
            <span className="font-data-mono text-[12px] text-error font-semibold flex items-center gap-0.5">
              {invoice.dueLine.icon && <Icon name={invoice.dueLine.icon} className="text-[13px]" />}
              {invoice.dueLine.text}
            </span>
          ) : (
            <span className="font-data-mono text-[12px] text-on-surface-variant">{invoice.dueLine.text}</span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 align-top text-right">
        <div className="flex flex-col items-end">
          <span className="font-title-sm text-title-sm text-on-surface font-bold font-data-mono">{invoice.amount}</span>
          <span className="font-data-mono text-[11px] text-on-surface-variant">{invoice.amountNet}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 align-top text-center">
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            ČEKA UPLATU
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            PLAĆENO
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 align-top text-right">
        <div className="flex items-center justify-end gap-1.5">
          {invoice.actions.map((action) =>
            action.kind === "pay" ? (
              <button
                key={action.icon}
                type="button"
                title={action.title}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-title-sm text-body-sm shadow-sm transition-all"
              >
                <Icon name={action.icon} className="text-[16px]" />
                <span>Plati IPS</span>
              </button>
            ) : (
              <button key={action.icon} type="button" title={action.title} className={ICON_BUTTON}>
                <Icon name={action.icon} className="text-[18px]" />
              </button>
            ),
          )}
        </div>
      </td>
    </tr>
  );
}

// simulirani IPS QR kod iz dizajna (boje preko klasa tema, bez sirovih vrednosti)
function QrCode() {
  return (
    <svg className="w-44 h-44 text-on-surface" fill="currentColor" viewBox="0 0 160 160" aria-hidden="true">
      {[
        [10, 10],
        [110, 10],
        [10, 110],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect fill="currentColor" height="40" rx="3" width="40" x={x} y={y} />
          <rect className="fill-surface-container-lowest" height="28" rx="2" width="28" x={x + 6} y={y + 6} />
          <rect fill="currentColor" height="16" rx="1" width="16" x={x + 12} y={y + 12} />
        </g>
      ))}
      {[
        [8, 8, 60, 15],
        [8, 8, 75, 15],
        [8, 8, 90, 25],
        [12, 6, 65, 35],
        [8, 12, 85, 45],
        [8, 8, 15, 60],
        [12, 8, 30, 70],
        [10, 6, 15, 85],
        [6, 8, 40, 85],
        [10, 10, 75, 60],
        [10, 10, 90, 60],
        [10, 10, 60, 75],
        [10, 10, 90, 75],
        [10, 10, 60, 90],
        [10, 10, 75, 90],
        [8, 16, 115, 65],
        [8, 8, 135, 65],
        [16, 8, 120, 90],
        [12, 12, 115, 115],
        [8, 16, 135, 120],
        [14, 8, 120, 135],
        [16, 8, 65, 115],
        [8, 16, 85, 125],
        [12, 8, 65, 135],
      ].map(([width, height, x, y]) => (
        <rect key={`${x}-${y}`} height={height} rx="1" width={width} x={x} y={y} />
      ))}
      {[
        [60, 60],
        [75, 75],
        [90, 90],
      ].map(([x, y]) => (
        <rect key={`c-${x}`} className="fill-primary" height="10" rx="1" width="10" x={x} y={y} />
      ))}
    </svg>
  );
}

export function FinanceView(props: FinanceViewProps) {
  const { kpis, ips, sef } = props;
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
            <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <Icon name="home" className="text-[15px]" />
              <span>Početna</span>
            </Link>
            <span className="text-outline-variant font-data-mono">/</span>
            <span className="text-on-surface font-semibold">Finansije i Fakture</span>
          </nav>
          <div className="flex items-baseline gap-3 pt-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Finansije i Fakturisanje</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-data-mono text-label-sm font-semibold">
              PIB: {props.pib}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Pregled zaduženja, mesečnih e-faktura zubotehničkih laboratorija, specifikacije protetskih materijala i evidencija plaćanja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-sm transition-all font-title-sm text-title-sm"
          >
            <Icon name="file_download" className="text-[18px] text-on-surface-variant" />
            <span>Izvezi izveštaj</span>
            <span className="font-data-mono text-[11px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">XLS/PDF</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm transition-all font-title-sm text-title-sm group"
          >
            <Icon name="sync_saved_locally" className="text-[19px] transition-transform group-hover:rotate-180" />
            <span>Poveži SEF (Sistem e-Faktura)</span>
            <span className="inline-block w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={KPI_CARD}>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-surface-container-low pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className={KPI_HEAD}>
              <span className={KPI_LABEL}>{kpis.debt.label}</span>
              <Icon name="account_balance_wallet" className="text-primary text-[20px]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">{kpis.debt.value}</span>
              <span className="font-data-mono text-body-sm text-on-surface-variant">RSD</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 bg-surface-container-low/40 rounded-lg px-2.5 py-1.5">
            <span className="flex items-center text-primary font-data-mono text-label-sm font-bold">
              <Icon name="trending_up" className="text-[16px]" />
              {kpis.debt.trend}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{kpis.debt.trendNote}</span>
          </div>
        </div>

        <div className={KPI_CARD}>
          <div>
            <div className={KPI_HEAD}>
              <span className={KPI_LABEL}>{kpis.settled.label}</span>
              <Icon name="check_circle" className="text-primary-container text-[20px]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">{kpis.settled.value}</span>
              <span className="font-data-mono text-body-sm text-on-surface-variant">RSD</span>
            </div>
          </div>
          <div className="mt-4 pt-1">
            <div className="flex justify-between items-center text-label-sm font-data-mono mb-1.5">
              <span className="text-on-surface-variant font-body-sm">{kpis.settled.percentLabel}</span>
              <span className="font-bold text-primary">{kpis.settled.percent}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${kpis.settled.barWidth}%` }} />
            </div>
          </div>
        </div>

        <div className={KPI_CARD}>
          <div>
            <div className={KPI_HEAD}>
              <span className={KPI_LABEL}>{kpis.dueSoon.label}</span>
              <Icon name="pending_actions" className="text-error text-[20px]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-error tracking-tight">{kpis.dueSoon.value}</span>
              <span className="font-data-mono text-body-sm text-on-surface-variant">RSD</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 bg-error-container/40 rounded-lg px-2.5 py-1.5">
            <span className="font-label-sm text-label-sm font-semibold text-on-error-container flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
              {kpis.dueSoon.note}
            </span>
            <span className="font-data-mono text-label-sm font-bold text-error">{kpis.dueSoon.urgency}</span>
          </div>
        </div>

        <div className={KPI_CARD}>
          <div>
            <div className={KPI_HEAD}>
              <span className={KPI_LABEL}>{kpis.advance.label}</span>
              <Icon name="savings" className="text-tertiary text-[20px]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">{kpis.advance.value}</span>
              <span className="font-data-mono text-body-sm text-on-surface-variant">RSD</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 bg-surface-container-low/60 rounded-lg px-2.5 py-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{kpis.advance.note}</span>
            <span className="font-data-mono text-label-sm font-semibold text-tertiary">{kpis.advance.state}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
            {props.tabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-title-sm text-title-sm transition-all ${
                  index === 0
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "bg-transparent text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full ${tab.pill}`}>{tab.count}</span>
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-transparent text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface font-title-sm text-title-sm transition-all ml-auto"
            >
              <Icon name="inventory_2" className="text-[17px]" />
              <span>Specifikacija utroška materijala</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
              <input
                type="text"
                placeholder="Pretraži br. fakture, SEF ID, pacijenta..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest shadow-sm transition-colors"
              />
            </div>
            {[
              { icon: "calendar_today", label: "Odabir obračunskog perioda", options: props.periods },
              { icon: "biotech", label: "Filtriraj po laboratoriji", options: props.labs },
              { icon: "filter_alt", label: "Filtriraj po statusu plaćanja", options: props.statuses },
            ].map((filter) => (
              <div key={filter.icon} className={SELECT_BOX}>
                <Icon name={filter.icon} className="text-on-surface-variant text-[18px]" />
                <select aria-label={filter.label} className={SELECT}>
                  {filter.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button"
              title="Resetuj filtere"
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ml-auto"
            >
              <Icon name="refresh" className="text-[20px]" />
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/80 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none">
                    <th className="py-3 px-4 font-semibold">Broj e-Fakture / SEF ID</th>
                    <th className="py-3 px-4 font-semibold">Laboratorija</th>
                    <th className="py-3 px-4 font-semibold">Nalozi i Pacijenti</th>
                    <th className="py-3 px-4 font-semibold">Izdato / Rok</th>
                    <th className="py-3 px-4 font-semibold text-right">Iznos (RSD)</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md divide-y-0">
                  {props.invoices.map((invoice) => (
                    <InvoiceRow key={invoice.number} invoice={invoice} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-body-sm text-body-sm">
              <span>{props.invoicesFooter}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="p-1 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <span className="px-3 py-1 rounded bg-primary text-on-primary font-data-mono text-label-sm font-semibold">1</span>
                {["2", "3"].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className="px-3 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container font-data-mono text-label-sm"
                  >
                    {page}
                  </button>
                ))}
                <button type="button" className="p-1 rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container">
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="layers" className="text-primary text-[22px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Utrošak sertifikovanih dentalnih materijala</h3>
              </div>
              <span className="font-data-mono text-label-sm text-on-surface-variant">Standard ISO 13485:2016</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {props.materials.map((material) => (
                <div key={material.name} className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <div className="flex justify-between items-center text-label-sm font-semibold text-on-surface-variant">
                    <span>{material.name}</span>
                    <span className={`${material.quantityTone} font-data-mono`}>{material.quantity}</span>
                  </div>
                  <span className="font-headline-sm text-title-md text-on-surface">{material.cost}</span>
                  <div className="w-full h-1 rounded-full bg-surface-container-high mt-1 overflow-hidden">
                    <div className={`h-full ${material.barClass} rounded-full`} style={{ width: `${material.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-5">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Icon name="qr_code_scanner" className="text-primary text-[22px]" />
                <h2 className="font-title-md text-title-md text-on-surface font-bold">NBS IPS Brzo Plaćanje</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono text-[11px] font-bold">IPS Pokaži</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Direktno plaćanje fakture <strong className="text-on-surface">{ips.invoice}</strong>. Skenirajte kamerom u aplikaciji bilo koje
              domaće mobilne banke.
            </p>
            <div className="bg-surface-bright p-4 rounded-xl flex flex-col items-center justify-center gap-3 shadow-inner">
              <div className="p-3 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-center">
                <QrCode />
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <span>Standardizovani NBS IPS format (Srbija)</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 font-body-sm text-body-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Primalac:</span>
                <span className="font-semibold text-on-surface">{ips.recipient}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Račun primaoca:</span>
                <span className="font-data-mono font-medium text-on-surface">{ips.account}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Iznos za uplatu:</span>
                <span className="font-data-mono font-bold text-headline-sm text-primary">{ips.amount}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Model i poziv na broj:</span>
                <span className="font-data-mono font-medium text-on-surface bg-surface-container px-2 py-0.5 rounded">{ips.reference}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant font-title-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="content_copy" className="text-[17px]" />
                <span>Kopiraj podatke</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-title-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Icon name="task_alt" className="text-[17px]" />
                <span>Evidentiraj uplatu</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Udeo troškova po laboratorijama</h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Oktobar</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container-low flex overflow-hidden">
              {props.labShares.map((share) => (
                <div
                  key={share.name}
                  className={`${share.barClass} h-full transition-all`}
                  style={{ width: `${share.percent}%` }}
                  title={`${share.name}: ${share.percent}%`}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2.5 pt-1">
              {props.labShares.map((share) => (
                <div key={share.name} className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm ${share.barClass}`} />
                    <span className="font-medium text-on-surface">{share.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-data-mono">
                    <span className="text-on-surface font-bold">{share.amount}</span>
                    <span className="text-on-surface-variant text-label-sm">({share.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Icon name="hub" className="text-primary text-[20px]" />
                <span className="font-title-sm text-title-sm text-on-surface font-bold">Ministarstvo Finansija • SEF API</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-data-mono text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Aktivno
              </span>
            </div>
            <div className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Sinhronizacija:</span>
                <span className="text-on-surface font-data-mono font-medium">{sef.syncedAgo}</span>
              </div>
              <div className="flex justify-between">
                <span>Sertifikat ordinacije:</span>
                <span className="text-on-surface font-medium">{sef.certificate}</span>
              </div>
              <div className="flex justify-between">
                <span>Automatski prijem XML:</span>
                <span className="text-primary font-medium">{sef.xml}</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-title-sm text-body-sm transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="history" className="text-[17px]" />
                <span>Dnevnik sinhronizacije e-Faktura</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
