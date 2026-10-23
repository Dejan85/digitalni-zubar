import type { StatusTone } from "@/lib/order-status";

const TONES: Record<StatusTone, string> = {
  neutral: "bg-muted/15 text-muted",
  info: "bg-primary-soft text-heading",
  success: "bg-primary text-white",
  danger: "bg-danger/15 text-danger",
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${TONES[tone]}`}>
      {label}
    </span>
  );
}
