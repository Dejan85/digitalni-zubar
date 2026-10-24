"use client";

import { FinanceView } from "@/components/finance/FinanceView";
import {
  FINANCE_COMPANY_PIB,
  FINANCE_KPIS,
  FINANCE_LABS,
  FINANCE_PERIODS,
  FINANCE_STATUSES,
  FINANCE_TABS,
  INVOICES,
  INVOICES_FOOTER,
  IPS_PAYMENT,
  LAB_SHARES,
  MATERIALS,
  SEF_STATUS,
} from "@/lib/finance-mock";

// ⚠ backend nema finansije (fakture, SEF, IPS) — cela stranica prikazuje mock iz lib/finance-mock.ts
export function FinanceContainer() {
  return (
    <FinanceView
      pib={FINANCE_COMPANY_PIB}
      kpis={FINANCE_KPIS}
      tabs={FINANCE_TABS}
      periods={FINANCE_PERIODS}
      labs={FINANCE_LABS}
      statuses={FINANCE_STATUSES}
      invoices={INVOICES}
      invoicesFooter={INVOICES_FOOTER}
      materials={MATERIALS}
      ips={IPS_PAYMENT}
      labShares={LAB_SHARES}
      sef={SEF_STATUS}
    />
  );
}
