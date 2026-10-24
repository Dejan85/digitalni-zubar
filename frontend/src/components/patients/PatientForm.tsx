import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/components/ui/Icon";

type FieldName = "firstName" | "lastName" | "birthDate" | "gender";

interface PatientFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  doctorName?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  // MOCK polja (broj kartona i sl.) koja backend nema — prikazuju se onemogućena
  mockRecordNumber: string;
}

// markup je prenet iz dizajn/pacijenti i medicinski kartoni/code.html (telo drawer-a)
const LABEL = "font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface";
const INPUT =
  "w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest disabled:opacity-60";
const ICON_INPUT = "w-full rounded-xl bg-surface-container-low py-2.5 pl-10 pr-3 text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest disabled:opacity-60";
const ICON = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant";
const GENDER_OPTION =
  "cursor-pointer rounded-lg py-1.5 text-center font-title-sm text-title-sm text-on-surface-variant hover:text-on-surface has-[:checked]:bg-surface-container-lowest has-[:checked]:font-semibold has-[:checked]:text-primary has-[:checked]:shadow-sm";

export function PatientForm(props: PatientFormProps) {
  const { fields, errors } = props;

  return (
    <form onSubmit={props.onSubmit} noValidate className="flex min-h-0 flex-1 flex-col justify-between">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="recordNumber" className={LABEL}>
              Broj kartona
            </label>
            <div className="relative">
              <Icon name="badge" className={ICON} />
              <input
                id="recordNumber"
                type="text"
                disabled
                title="Uskoro"
                defaultValue={props.mockRecordNumber}
                className={`${ICON_INPUT} font-data-mono text-data-mono`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={LABEL}>Pol</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1">
              <label className={GENDER_OPTION}>
                <input type="radio" value="M" className="sr-only" {...fields.gender} />
                Muški
              </label>
              <label className={GENDER_OPTION}>
                <input type="radio" value="Z" className="sr-only" {...fields.gender} />
                Ženski
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className={LABEL}>
              Ime *
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="npr. Marko"
              aria-invalid={!!errors.firstName}
              className={INPUT}
              {...fields.firstName}
            />
            {errors.firstName && <p className="text-body-sm text-error">{errors.firstName.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className={LABEL}>
              Prezime *
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="npr. Petrović"
              aria-invalid={!!errors.lastName}
              className={INPUT}
              {...fields.lastName}
            />
            {errors.lastName && <p className="text-body-sm text-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="jmbg" className={LABEL}>
              JMBG (13 cifara)
            </label>
            <input
              id="jmbg"
              type="text"
              maxLength={13}
              placeholder="0101990710000"
              disabled
              title="Uskoro"
              className={`${INPUT} font-data-mono text-data-mono`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthDate" className={LABEL}>
              Datum rođenja *
            </label>
            <input
              id="birthDate"
              type="date"
              aria-invalid={!!errors.birthDate}
              className={`${INPUT} py-2`}
              {...fields.birthDate}
            />
            {errors.birthDate && <p className="text-body-sm text-error">{errors.birthDate.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={LABEL}>
            Broj telefona *
          </label>
          <div className="relative">
            <Icon name="call" className={ICON} />
            <input
              id="phone"
              type="tel"
              placeholder="+381 6X XXX XXXX"
              disabled
              title="Uskoro"
              className={`${ICON_INPUT} font-body-md text-body-md`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={LABEL}>
            Email adresa
          </label>
          <div className="relative">
            <Icon name="mail" className={ICON} />
            <input
              id="email"
              type="email"
              placeholder="pacijent@primer.rs"
              disabled
              title="Uskoro"
              className={`${ICON_INPUT} font-body-md text-body-md`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="medicalNotes" className={LABEL}>
              Medicinske napomene & Alergije
            </label>
            <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-error">
              <Icon name="warning" className="text-[14px]" /> Važno
            </span>
          </div>
          <textarea
            id="medicalNotes"
            rows={3}
            disabled
            title="Uskoro"
            placeholder="Npr. Alergija na penicilin, lokalni anestetici bez adrenalina, sklonost krvarenju..."
            className="w-full resize-none rounded-xl bg-surface-container-low p-3.5 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-container-lowest disabled:opacity-60"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
          <div className="flex items-center gap-2">
            <Icon name="stethoscope" className="text-[20px] text-primary" />
            <span className="font-title-sm text-title-sm text-on-surface">Nadležni lekar: {props.doctorName ?? "—"}</span>
          </div>
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
            Podrazumevano
          </span>
        </div>

        {props.formError && (
          <p role="alert" className="text-body-sm text-error">
            {props.formError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 bg-surface-container-low/50 p-6">
        <button
          type="button"
          onClick={props.onCancel}
          className="rounded-xl bg-surface-container px-4 py-2.5 font-title-sm text-title-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          Otkaži
        </button>
        <button
          type="submit"
          disabled={props.isSubmitting}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 font-title-sm text-title-sm text-on-primary shadow-md transition-all hover:bg-primary-container disabled:opacity-60"
        >
          <Icon name="check" className="text-[18px]" />
          <span>{props.isSubmitting ? "Čuvanje..." : props.submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
