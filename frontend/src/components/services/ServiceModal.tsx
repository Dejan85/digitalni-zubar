import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

interface ServiceModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode; // forma
}

// modal "Nova usluga u katalogu" iz dizajn/katalog; samo ljuska, bez logike
export function ServiceModal({ title, subtitle, onClose, children }: ServiceModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-space-md backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col gap-space-md overflow-y-auto rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
