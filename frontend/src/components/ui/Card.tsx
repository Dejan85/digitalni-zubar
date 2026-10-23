import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  // dark = naglasena tamna kartica (npr. "porudzbine koje kasne")
  tone?: "light" | "dark" | "primary";
}

const TONES = {
  light: "bg-card text-foreground shadow-[0_2px_20px_rgba(20,32,26,0.06)]",
  dark: "bg-primary-dark text-white",
  primary: "bg-primary text-white",
};

export function Card({ tone = "light", className = "", ...props }: CardProps) {
  return <div className={`rounded-card p-6 ${TONES[tone]} ${className}`} {...props} />;
}
