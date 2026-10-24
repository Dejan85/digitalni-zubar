import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  // dark = naglasena tamna kartica (npr. "porudzbine koje kasne")
  tone?: "light" | "dark" | "primary";
}

const TONES = {
  light: "bg-card text-foreground shadow-card",
  dark: "bg-primary-dark text-white",
  primary: "bg-primary text-card",
};

export function Card({ tone = "light", className = "", ...props }: CardProps) {
  return <div className={`rounded-card p-6 ${TONES[tone]} ${className}`} {...props} />;
}
