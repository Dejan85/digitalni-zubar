import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "dark";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  // glavna akcija (CTA): svetla lime sa tamnim tekstom zbog kontrasta
  accent: "bg-accent text-primary-dark hover:bg-accent-hover",
  outline: "border border-primary/30 bg-transparent text-primary-dark hover:bg-primary-soft",
  dark: "bg-primary-dark text-white hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// "pill" dugme (rounded-full) kao na referentnom dizajnu
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
