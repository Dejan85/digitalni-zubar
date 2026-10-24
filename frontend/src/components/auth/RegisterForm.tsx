import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/components/ui/Icon";
import type { PasswordStrength } from "@/lib/password-strength";

export type AccountType = "doktor" | "proteticar";

type FieldName = "companyName" | "type" | "phone" | "email" | "password" | "passwordConfirm" | "termsAccepted" | "privacyAccepted";

interface RegisterFormProps {
  fields: Record<FieldName, UseFormRegisterReturn>;
  errors: Partial<Record<FieldName, FieldError>>;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  accountType: AccountType;
  passwordStrength: PasswordStrength;
}

const INPUT =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface shadow-xs outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:border-error disabled:cursor-not-allowed disabled:opacity-60";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface";
const REQUIRED = <span className="text-error">*</span>;

function ErrorText({ error }: { error?: FieldError }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-error">
      {error.message}
    </p>
  );
}

const ACCOUNT_TYPES: { value: AccountType; icon: string; title: string; text: string }[] = [
  {
    value: "doktor",
    icon: "stethoscope",
    title: "Stomatološka ordinacija",
    text: "Za stomatologe, slanje radnih naloga, vođenje kartona i direktno slanje 3D intraoralnih otisaka.",
  },
  {
    value: "proteticar",
    icon: "memory",
    title: "Zubotehnička laboratorija",
    text: "Za laboratorije, prijem STL modela, definisanje cenovnika i praćenje faza proizvodnje protetike.",
  },
];

const STEPS = [
  { title: "Osnovni podaci", text: "Tip delatnosti & profil" },
  { title: "Verifikacija", text: "Licenca komore i PIB" },
  { title: "Integracije", text: "3Shape, Medit, Exocad" },
];

const TRUST_BADGES = [
  { icon: "lock", title: "End-to-End enkripcija", text: "Medicinski podaci pacijenata" },
  { icon: "receipt_long", title: "SEF e-Fakture", text: "Automatsko usklađivanje" },
  { icon: "verified_user", title: "ISO 27001 standard", text: "Sertifikovana bezbednost" },
];

// dizajn/registar strana: zaglavlje, stepper, forma u kartici, bedževi poverenja; izgled iz code.html, bez logike
export function RegisterForm({
  fields,
  errors,
  formError,
  isSubmitting,
  onSubmit,
  accountType,
  passwordStrength,
}: RegisterFormProps) {
  return (
    <div className="flex flex-1 flex-col justify-between bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/login" className="group flex items-center gap-3" title="Digitalni Zubar B2B">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-fixed-dim bg-primary-fixed text-primary shadow-sm transition-transform group-hover:scale-105">
              <Icon name="dentistry" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold leading-tight tracking-tight text-on-surface">
                Digitalni<span className="text-primary">Zubar</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">B2B Dental Platform</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-on-surface-variant sm:inline">Već imate registrovani nalog?</span>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary hover:bg-surface-container-low hover:text-primary"
            >
              Prijavite se
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
              B2B Stomatološka mreža Srbije
            </span>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
              Otvorite nalog za vašu ordinaciju ili laboratoriju
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant sm:text-base">
              Povežite se sa partnerskim laboratorijama i stomatolozima širom Srbije uz bezbednu razmenu 3D intraoralnih
              skenova, digitalnih radnih naloga i e-faktura.
            </p>
          </div>

          {/* stepper je vizuelan (MOCK): registracija je jedan korak, verifikacije i integracija nema */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
              {STEPS.map((step, index) => {
                const isActive = index === 0;
                return (
                  <div key={step.title} className="flex flex-col items-center">
                    <div className="flex w-full items-center">
                      <div
                        className={`h-1 flex-1 ${index === 0 ? "rounded-l" : ""} ${isActive ? "bg-primary" : "bg-outline-variant"}`}
                      ></div>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${isActive ? "bg-primary font-bold text-on-primary ring-4 ring-primary-fixed" : "border-2 border-outline-variant bg-surface-container font-semibold text-on-surface-variant"}`}
                      >
                        {index + 1}
                      </div>
                      <div
                        className={`h-1 flex-1 ${index === STEPS.length - 1 ? "rounded-r" : ""} ${isActive ? "bg-primary" : "bg-outline-variant"}`}
                      ></div>
                    </div>
                    <span className={`mt-2 text-xs ${isActive ? "font-bold text-on-primary-fixed" : "font-semibold text-on-surface-variant"}`}>
                      {step.title}
                    </span>
                    <span className="hidden text-[11px] text-on-surface-variant sm:block">{step.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-10">
            <form onSubmit={onSubmit} className="space-y-8" noValidate>
              <div>
                <label className="mb-1 block text-sm font-bold text-on-surface">Izaberite tip delatnosti {REQUIRED}</label>
                <p className="mb-4 text-xs text-on-surface-variant">
                  Prilagođavamo radnu površinu vašim specifičnim procesima rada.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {ACCOUNT_TYPES.map((option) => {
                    const isSelected = accountType === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`group relative flex cursor-pointer flex-col rounded-xl p-5 shadow-xs transition ${isSelected ? "border-2 border-primary bg-primary-fixed/40 hover:bg-primary-fixed/70" : "border border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low"}`}
                      >
                        <input type="radio" value={option.value} className="sr-only" {...fields.type} />
                        <div className="flex items-start justify-between">
                          <div
                            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${isSelected ? "bg-primary-fixed-dim text-primary" : "bg-surface-container text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary"}`}
                          >
                            <Icon name={option.icon} size={24} />
                          </div>
                          {isSelected ? (
                            <span className="inline-flex items-center rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary">
                              Izabrano
                            </span>
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-outline-variant"></span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-on-surface">{option.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{option.text}</p>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-outline-variant/50" />

              <div>
                <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  Podaci o pravnom licu i odgovornom licu
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="companyName">
                      Naziv ordinacije ili laboratorije {REQUIRED}
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder="npr. Stomatološka ordinacija Dr Marković"
                      aria-invalid={!!errors.companyName}
                      className={INPUT}
                      {...fields.companyName}
                    />
                    <ErrorText error={errors.companyName} />
                  </div>
                  {/* nema polja na backendu (MOCK, disabled): ime odgovornog lica, PIB, licenca */}
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="doctorName">
                      Ime i prezime odgovornog lica / doktora {REQUIRED}
                    </label>
                    <input
                      id="doctorName"
                      type="text"
                      disabled
                      title="Uskoro"
                      placeholder="npr. Dr Milan Marković"
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="email">
                      Službena email adresa {REQUIRED}
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                        <Icon name="alternate_email" size={16} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="ordinacija@markovic.rs"
                        aria-invalid={!!errors.email}
                        className={`${INPUT} pl-9`}
                        {...fields.email}
                      />
                    </div>
                    <ErrorText error={errors.email} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="phone">
                      Kontakt telefon ordinacije {REQUIRED}
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                        <Icon name="call" size={16} />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+381 6X XXX XXXX"
                        aria-invalid={!!errors.phone}
                        className={`${INPUT} pl-9`}
                        {...fields.phone}
                      />
                    </div>
                    <ErrorText error={errors.phone} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="pib">
                      PIB / Matični broj {REQUIRED}
                    </label>
                    <input id="pib" type="text" disabled title="Uskoro" placeholder="108XXXXXX" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="licence">
                      Broj licence komore (SKS) {REQUIRED}
                    </label>
                    <input id="licence" type="text" disabled title="Uskoro" placeholder="npr. 503921" className={INPUT} />
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/50" />

              <div>
                <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  Bezbednost naloga
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="password">
                      Kreirajte lozinku {REQUIRED}
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Minimalno 8 karaktera"
                      aria-invalid={!!errors.password}
                      className={INPUT}
                      {...fields.password}
                    />
                    <ErrorText error={errors.password} />
                    <div className="mt-2">
                      <div className="mb-1 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((segment) => (
                          <span
                            key={segment}
                            className={`h-1 flex-1 rounded ${segment <= passwordStrength.level ? "bg-primary" : "bg-outline-variant"}`}
                          ></span>
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-on-primary-fixed">{passwordStrength.message}</span>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="passwordConfirm">
                      Potvrdite lozinku {REQUIRED}
                    </label>
                    <input
                      id="passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Ponovite lozinku"
                      aria-invalid={!!errors.passwordConfirm}
                      className={INPUT}
                      {...fields.passwordConfirm}
                    />
                    <ErrorText error={errors.passwordConfirm} />
                    <span className="mt-2 block text-[11px] text-on-surface-variant">
                      Obavezno uneti identičnu kombinaciju karaktera.
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/50" />

              <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-low/70 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    aria-invalid={!!errors.termsAccepted}
                    className="mt-0.5 h-4 w-4 rounded accent-primary"
                    {...fields.termsAccepted}
                  />
                  <span className="text-xs leading-normal text-on-surface">
                    Prihvatam{" "}
                    <span className="font-semibold text-on-primary-fixed underline">Uslove korišćenja B2B platforme</span>{" "}
                    i{" "}
                    <span className="font-semibold text-on-primary-fixed underline">
                      Politiku privatnosti medicinskih podataka
                    </span>
                    .
                  </span>
                </label>
                <ErrorText error={errors.termsAccepted} />
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    aria-invalid={!!errors.privacyAccepted}
                    className="mt-0.5 h-4 w-4 rounded accent-primary"
                    {...fields.privacyAccepted}
                  />
                  <span className="text-xs leading-normal text-on-surface">
                    Saglasan sam sa obradom podataka u skladu sa Zakonom o zaštiti podataka o ličnosti (ZZPL / GDPR)
                    Republike Srbije.
                  </span>
                </label>
                <ErrorText error={errors.privacyAccepted} />
              </div>

              <div className="pt-2">
                {formError && (
                  <p role="alert" className="mb-3 text-center text-sm text-error">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-fixed disabled:opacity-60"
                >
                  <span>{isSubmitting ? "Registracija..." : "Nastavite na verifikaciju licence"}</span>
                  <Icon name="arrow_forward" size={20} />
                </button>
                <p className="mt-3 text-center text-xs text-on-surface-variant">
                  Verifikacija licence se obavlja u roku od nekoliko minuta proverom u zvaničnom registru SKS.
                </p>
              </div>
            </form>
          </div>

          <div className="mt-8 border-t border-outline-variant pt-6">
            <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3 sm:text-left">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.title} className="flex items-center justify-center gap-3 text-on-surface-variant sm:justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    <Icon name={badge.icon} size={16} />
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold text-on-surface">{badge.title}</span>
                    <span>{badge.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 w-full border-t border-outline-variant bg-surface-container-lowest py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-on-surface-variant sm:flex-row sm:px-6 lg:px-8">
          <div>© 2025 Digitalni Zubar d.o.o. Sva prava zadržana. B2B dentalni sistem za digitalnu stomatologiju.</div>
          <div className="flex items-center gap-6">
            <span>Pomoć i podrška</span>
            <span>Bezbednost podataka</span>
            <span>Tehnički zahtevi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
