import type { ReactNode } from "react";

interface IconBadgeProps {
  children: ReactNode;
  tone?: "soft" | "solid" | "onDark";
  shape?: "square" | "circle";
}

const TONES = {
  soft: "bg-primary-soft text-primary",
  solid: "bg-primary text-white",
  onDark: "bg-white text-primary-dark",
};

// ikonica u kvadratnom ili kruznom polju (kao na statistickim karticama referentnog dizajna)
export function IconBadge({ children, tone = "soft", shape = "square" }: IconBadgeProps) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  return (
    <span className={`inline-flex size-10 items-center justify-center ${radius} ${TONES[tone]}`}>{children}</span>
  );
}
