import type { StatusTone } from "@/lib/order-status";

// opšti tonovi (veze i sl.); statusi porudžbine imaju sopstvene boje preko data-status (globals.css)
const TONES = {
  neutral: "bg-surface-container text-muted",
  info: "bg-primary-soft text-heading",
  success: "bg-primary text-card",
  danger: "bg-danger/15 text-danger",
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const base = "inline-flex h-6 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold uppercase tracking-wide";
  if (tone in TONES) {
    return <span className={`${base} ${TONES[tone as keyof typeof TONES]}`}>{label}</span>;
  }
  return (
    <span
      data-status={tone}
      className={`${base} whitespace-nowrap border border-(--chip-border) bg-(--chip-bg) text-(--chip-fg)`}
    >
      <span className="size-1.5 rounded-full bg-(--chip-fg)" aria-hidden="true" />
      {label}
    </span>
  );
}
