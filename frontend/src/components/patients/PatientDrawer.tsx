import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

interface PatientDrawerProps {
  title: string;
  subtitle: string;
  icon: string;
  onClose: () => void;
  children: ReactNode; // forma (telo + podnožje)
}

// bočni panel iz dizajn/pacijenti i medicinski kartoni (drawer "Dodaj novog pacijenta"); samo ljuska, bez logike
export function PatientDrawer({ title, subtitle, icon, onClose, children }: PatientDrawerProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col justify-between bg-surface-container-lowest shadow-2xl"
      >
        <div className="flex items-center justify-between bg-surface-container-low/50 p-6">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Icon name={icon} className="text-[22px]" />
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
