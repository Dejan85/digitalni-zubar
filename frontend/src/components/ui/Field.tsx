import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

const FIELD_STYLES =
  "h-11 w-full rounded-xl border border-primary/25 bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-danger";

interface FieldProps {
  label: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}

// labela + kontrola + poruka o grešci; povezano preko htmlFor/aria za pristupačnost
export function Field({ label, error, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-heading">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", ...props },
  ref,
) {
  return <input ref={ref} className={`${FIELD_STYLES} ${className}`} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = "", ...props },
  ref,
) {
  return <select ref={ref} className={`${FIELD_STYLES} ${className}`} {...props} />;
});
