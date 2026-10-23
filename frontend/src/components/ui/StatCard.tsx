import type { ReactNode } from "react";

import { Card } from "./Card";
import { IconBadge } from "./IconBadge";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "light" | "dark";
}

export function StatCard({ label, value, hint, icon, tone = "light" }: StatCardProps) {
  const dark = tone === "dark";
  return (
    <Card tone={tone}>
      <div className="flex items-center gap-3">
        <IconBadge tone={dark ? "onDark" : "soft"}>{icon}</IconBadge>
        <span className={`text-sm font-medium ${dark ? "text-white/80" : "text-muted"}`}>{label}</span>
      </div>
      <div className="mt-6 text-4xl font-semibold tracking-tight">{value}</div>
      {hint && <div className={`mt-1 text-sm ${dark ? "text-white/70" : "text-muted"}`}>{hint}</div>}
    </Card>
  );
}
