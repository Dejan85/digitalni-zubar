import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "dark";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-card hover:bg-primary-hover",
  // sekundarni naglasak: menta sa tamnim tekstom zbog kontrasta
  accent: "bg-accent text-heading hover:bg-accent-hover",
  outline: "border border-line bg-card text-heading hover:bg-surface-container",
  dark: "bg-primary-dark text-white hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// dugme sa blago zaobljenim ivicama (rounded-lg) kao u dizajn/DESIGN.md
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
