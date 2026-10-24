import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { MOCK_SERVICE_CATEGORIES } from "@/lib/orders-mock";

type FieldName = "name" | "price";

interface ServiceFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  // MOCK polje (šifra) koje backend nema — prikazuje se onemogućeno
  mockCode: string;
}

// markup je prenet iz dizajn/katalog/code.html (modal "Nova usluga u katalogu"); polja koja backend nema su onemogućena ("Uskoro")
const LABEL = "font-label-sm text-label-sm font-semibold text-on-surface";
const INPUT =
  "w-full rounded-lg bg-surface-container-low px-3 py-2 font-body-sm text-body-sm text-on-surface shadow-sm outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest disabled:opacity-60";
const CHECK_OPTION = "flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5 transition-colors has-[:disabled]:opacity-60";

const IMPRESSION_OPTIONS = [
  { label: "Digitalni STL / PLY", hint: "Direktno slanje skena", checked: true },
  { label: "Fizički otisak", hint: "Silikon / Alginat", checked: false },
  { label: "CBCT 3D DICOM", hint: "Za hirurške vodiče", checked: false },
];

export function ServiceForm({ fields, errors, formError, isSubmitting, submitLabel, onSubmit, onCancel, mockCode }: ServiceFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="mt-1 flex flex-col gap-space-md">
      <div className="grid grid-cols-1 gap-space-sm md:grid-cols-3">
        <div className="flex flex-col gap-1 md:col-span-1">
          <label htmlFor="code" className={LABEL}>
            Interna šifra
          </label>
          <input id="code" type="text" disabled title="Uskoro" placeholder={`npr. ${mockCode}`} className={INPUT} />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="name" className={LABEL}>
            Naziv usluge / rada
          </label>
          <input
            id="name"
            type="text"
            placeholder="npr. Cirkon-keramički most 3 člana"
            aria-invalid={!!errors.name}
            className={INPUT}
            {...fields.name}
          />
          {errors.name && <p className="font-body-sm text-body-sm text-error">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-sm md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className={LABEL}>
            Kategorija protetike
          </label>
          <select id="category" disabled title="Uskoro" className={INPUT}>
            {MOCK_SERVICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className={LABEL}>
            Osnovna cena (RSD)
          </label>
          <div className="relative flex items-center">
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="8500"
              aria-invalid={!!errors.price}
              className={`${INPUT} pl-3 pr-12 font-data-mono`}
              {...fields.price}
            />
            <span className="absolute right-3 font-label-sm text-label-sm font-bold text-on-surface-variant">RSD</span>
          </div>
          {errors.price && <p className="font-body-sm text-body-sm text-error">{errors.price.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-sm md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="leadDays" className={LABEL}>
            Standardni rok izrade (radnih dana)
          </label>
          <input id="leadDays" type="number" min={1} max={30} defaultValue={3} disabled title="Uskoro" className={INPUT} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="urgent" className={LABEL}>
            Hitna izrada uz doplatu
          </label>
          <select id="urgent" disabled title="Uskoro" className={INPUT}>
            <option value="da">Dozvoljeno (+30% cena, 24-48h)</option>
            <option value="ne">Nije dostupno za ovu vrstu rada</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>Prihvatljivi formati otiska / inputa</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {IMPRESSION_OPTIONS.map((option) => (
            <label key={option.label} className={CHECK_OPTION} title="Uskoro">
              <input type="checkbox" disabled defaultChecked={option.checked} className="rounded accent-primary" />
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm font-semibold text-on-surface">{option.label}</span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">{option.hint}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={LABEL}>
          Kratak opis rada i preporuka za preparaciju zubaru
        </label>
        <textarea
          id="description"
          rows={3}
          disabled
          title="Uskoro"
          placeholder="Navedite preporučeni tip preparacije (npr. stepenik zaobljeni chamfer min 0.8mm, preporučeni cement, raspon indikacija...)"
          className={`${INPUT} resize-none p-3`}
        />
      </div>

      {formError && (
        <p role="alert" className="font-body-sm text-body-sm text-error">
          {formError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-space-sm pt-space-xs">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-surface-container-low px-space-md py-2.5 font-title-sm text-title-sm text-on-surface transition-colors hover:bg-surface-container"
        >
          Odustani
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-space-md py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          {isSubmitting ? "Čuvanje..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
