import Link from "next/link";
import type { FormEventHandler } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/components/ui/Icon";

export type LoginRole = "doctor" | "lab";

export interface DemoAccount {
  label: string;
  role: LoginRole;
  dotClassName: string;
}

interface LoginFormProps {
  fields: { email: UseFormRegisterReturn; password: UseFormRegisterReturn };
  errors: { email?: FieldError; password?: FieldError };
  formError: string | null;
  notice: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  isPasswordVisible: boolean;
  onTogglePassword: () => void;
  demoAccounts: DemoAccount[]; // prazno u produkciji
  onDemo: (index: number) => void;
}

const INPUT =
  "block w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:border-error";
const LABEL = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface";
const ROLE_BASE =
  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150 sm:text-sm";
const ROLE_ACTIVE = "bg-surface-container-lowest text-on-surface shadow-sm";
const ROLE_IDLE = "text-on-surface-variant hover:bg-surface-container-lowest/60 hover:text-on-surface";

// dizajn/login strana: kartica sa formom levo i panelom prednosti desno; izgled iz code.html, bez logike
export function LoginForm({
  fields,
  errors,
  formError,
  notice,
  isSubmitting,
  onSubmit,
  role,
  onRoleChange,
  isPasswordVisible,
  onTogglePassword,
  demoAccounts,
  onDemo,
}: LoginFormProps) {
  const isDoctor = role === "doctor";
  return (
    <div className="flex flex-1 flex-col justify-between bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main
        className="dental-grid-pattern flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-10"
        data-purpose="auth-page-container"
      >
        <div className="flex min-h-[760px] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-xl shadow-on-surface/10 lg:flex-row">
          {/* leva kolona: forma */}
          <section className="flex w-full flex-col justify-between p-8 sm:p-12 lg:w-7/12 lg:p-14">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary-fixed-dim bg-primary-fixed text-primary shadow-sm">
                  <Icon name="dentistry" size={24} />
                </div>
                <div>
                  <div className="font-heading text-xl font-bold leading-tight tracking-tight text-on-surface">
                    Digitalni Zubar
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    B2B Dental Platform
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                  Prijavite se na platformu
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Pristupite radnim nalozima, kartonima pacijenata i direktnoj laboratorijskoj razmeni.
                </p>
              </div>

              {notice && (
                <p className="mb-6 rounded-xl bg-primary-fixed px-4 py-3 text-sm text-on-primary-fixed">{notice}</p>
              )}

              {/* tip naloga se na serveru određuje iz firme, ovo je samo vizuelni izbor (MOCK, vidi REDIZAJN_MOCK.md §8) */}
              <div className="mb-6 flex items-center gap-1.5 rounded-xl bg-surface-container p-1.5" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isDoctor}
                  onClick={() => onRoleChange("doctor")}
                  className={`${ROLE_BASE} ${isDoctor ? ROLE_ACTIVE : ROLE_IDLE}`}
                >
                  <Icon name="person_add" size={16} className={isDoctor ? "text-primary" : "text-outline"} />
                  <span>Stomatološka ordinacija</span>
                  <span
                    className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${isDoctor ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}
                  >
                    Doktor
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isDoctor}
                  onClick={() => onRoleChange("lab")}
                  className={`${ROLE_BASE} ${!isDoctor ? ROLE_ACTIVE : ROLE_IDLE}`}
                >
                  <Icon name="science" size={16} className={!isDoctor ? "text-primary" : "text-outline"} />
                  <span>Zubotehnička laboratorija</span>
                  <span
                    className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${!isDoctor ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}
                  >
                    Tehničar
                  </span>
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div>
                  <label className={LABEL} htmlFor="email">
                    Email adresa ili broj licence SKS
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline">
                      <Icon name="mail" size={20} />
                    </div>
                    <input
                      id="email"
                      type="text"
                      autoComplete="email"
                      placeholder="npr. milan.markovic@ordinacija.rs"
                      aria-invalid={!!errors.email}
                      className={`${INPUT} pl-11 pr-4`}
                      {...fields.email}
                    />
                  </div>
                  {errors.email && (
                    <p role="alert" className="mt-1.5 text-xs text-error">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={LABEL} htmlFor="password">
                    Lozinka
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline">
                      <Icon name="lock" size={20} />
                    </div>
                    <input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Unesite vašu lozinku"
                      aria-invalid={!!errors.password}
                      className={`${INPUT} pl-11 pr-11`}
                      {...fields.password}
                    />
                    <button
                      type="button"
                      aria-label="Prikaži ili sakrij lozinku"
                      onClick={onTogglePassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-outline hover:text-on-surface-variant focus:outline-none"
                    >
                      <Icon name={isPasswordVisible ? "visibility_off" : "visibility"} size={20} />
                    </button>
                  </div>
                  {errors.password && (
                    <p role="alert" className="mt-1.5 text-xs text-error">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* "zapamti me" i "zaboravljena lozinka" nemaju backend (MOCK) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-not-allowed items-center opacity-70" title="Uskoro">
                    <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded accent-primary" />
                    <span className="ml-2 text-xs font-semibold text-on-surface-variant">Zapamti me na ovom uređaju</span>
                  </label>
                  <button
                    type="button"
                    disabled
                    title="Uskoro"
                    className="cursor-not-allowed text-xs font-bold text-primary opacity-70"
                  >
                    Zaboravili ste lozinku?
                  </button>
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-error">
                    {formError}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-on-primary shadow-md shadow-primary/20 transition hover:bg-primary-container active:scale-[0.99] disabled:opacity-60"
                  >
                    <span>{isSubmitting ? "Prijavljivanje..." : "Prijavite se"}</span>
                    <Icon name="arrow_forward" size={16} />
                  </button>
                </div>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-surface-container-lowest px-3 font-semibold text-outline">ili se prijavite pomoću</span>
                </div>
              </div>

              <button
                type="button"
                disabled
                title="Uskoro"
                className="group flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-xs font-semibold text-on-surface-variant opacity-70 shadow-sm sm:text-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-error/30 bg-error-container text-[10px] font-bold text-on-error-container">
                  SKS
                </div>
                <span>Prijavi se sa SKS e-ID sertifikatom</span>
                <span className="inline-flex items-center rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
                  Smart Card / USB
                </span>
              </button>

              {demoAccounts.length > 0 && (
                <div className="mt-6 border-t border-outline-variant pt-5">
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-outline">
                    Brzi test demo nalozi:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {demoAccounts.map((account, index) => (
                      <button
                        key={account.label}
                        type="button"
                        onClick={() => onDemo(index)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface transition hover:border-primary hover:bg-primary-fixed/40"
                      >
                        <span className={`h-2 w-2 rounded-full ${account.dotClassName}`}></span>
                        <span>
                          Test demo: <strong>{account.label}</strong>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 text-center text-xs text-on-surface-variant sm:text-left sm:text-sm">
              Nemate nalog ordinacije?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Registrujte ordinaciju ili zubotehničku laboratoriju
              </Link>
            </div>
          </section>

          {/* desna kolona: prednosti platforme (statičan sadržaj iz dizajna) */}
          <section className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-container via-primary-container to-tertiary-container p-8 text-on-primary-container sm:p-12 lg:w-5/12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-on-primary-container/10 blur-3xl"></div>
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"></div>

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-on-primary-container/20 bg-on-primary-container/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-fixed-dim"></span>
                Sigurna medicinska B2B mreža
              </div>
              <h2 className="font-heading text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                Standardizovana digitalna stomatologija na jednom mestu.
              </h2>
              <p className="mt-3 text-sm font-normal leading-relaxed opacity-90">
                Povežite ordinaciju direktno sa zubnim tehničarima. Šaljite 3D skenove, pratite probu i isporuku bez
                telefonskih poziva i nesporazuma.
              </p>

              <div className="mt-8 space-y-3.5">
                {[
                  {
                    icon: "deployed_code",
                    title: "100% digitalna razmena 3D skenova",
                    text: "Automatsko povezivanje STL, PLY i DICOM fajlova sa intraoralnog skenera direktno u radni nalog.",
                  },
                  {
                    icon: "schedule",
                    title: "Praćenje faza rada u realnom vremenu",
                    text: "Statusi: U izradi, Poslato na probu, Dorada ili Završen rad sa automatskim SMS/Viber obaveštenjem.",
                  },
                  {
                    icon: "verified_user",
                    title: "GDPR & Medicinski propisi RS",
                    text: "End-to-end šifrovano čuvanje JMBG-a, zdravstvenih kartona i generisanje garantnih listova protetike.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3.5 rounded-2xl border border-on-primary-container/15 bg-on-primary-container/10 p-3.5 backdrop-blur-md"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/20">
                      <Icon name={feature.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider">{feature.title}</h3>
                      <p className="mt-0.5 text-xs opacity-80">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-on-primary-container/20 pt-6">
              <div>
                <div className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
                  <span>240+</span>
                  <span className="text-xs font-normal text-secondary-fixed-dim">•</span>
                  <span>65+</span>
                </div>
                <p className="text-[11px] opacity-80">Ordinacija i zubotehničkih laboratorija u Srbiji</p>
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {[
                  { label: "BG", opacity: "bg-on-primary-container/20" },
                  { label: "NS", opacity: "bg-on-primary-container/30" },
                  { label: "NI", opacity: "bg-on-primary-container/40" },
                ].map((city) => (
                  <span
                    key={city.label}
                    className={`inline-block h-8 w-8 rounded-full text-center text-[11px] font-bold leading-8 ring-2 ring-primary-container ${city.opacity}`}
                  >
                    {city.label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-outline">
        <p>© 2025 Digitalni Zubar. Sva prava zadržana. Usklađeno sa Zakonom o zdravstvenoj zaštiti RS.</p>
      </footer>
    </div>
  );
}
