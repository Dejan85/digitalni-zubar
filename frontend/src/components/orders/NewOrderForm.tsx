import Link from "next/link";
import type { FormEventHandler, ReactNode, SelectHTMLAttributes } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  MOCK_ALL_TEETH,
  MOCK_FRONT_TEETH,
  MOCK_LAB_LEAD_TIME,
  MOCK_LOWER_TEETH,
  MOCK_ABUTMENT_OPTIONS,
  MOCK_SPEC_OPTIONS,
  MOCK_UPPER_TEETH,
  type MockTooth,
} from "@/lib/orders-mock";

// markup je prenet iz dizajn/kreiranje novog protetskog naloga/code.html (iste Tailwind klase).
// Šta je mock/disabled: documentation/REDIZAJN_MOCK.md §4.

export interface NewOrderValues {
  technicianId: string;
  patientId: string;
  items: {
    mode: "catalog" | "free";
    serviceId: string;
    freeDescription: string;
    quantity: string;
    price: string;
  }[];
}

export interface Option {
  value: string;
  label: string;
}

interface NewOrderFormProps {
  register: UseFormRegister<NewOrderValues>;
  errors: FieldErrors<NewOrderValues>;
  technicianOptions: Option[];
  patientOptions: Option[];
  serviceOptions: Option[];
  technicianName: string;
  patientName: string;
  patientHref: string;
  hasTechnician: boolean;
  itemModes: ("catalog" | "free")[];
  itemTitles: string[]; // naziv stavke za naslov kartice i sažetak
  itemQuantities: number[];
  itemUnitPrices: string[]; // već formatirano, "" kad se ne može izračunati
  itemLineTotals: string[];
  total: string;
  unitsCount: number;
  itemsCount: number;
  selectedTeeth: string[];
  onToggleTooth: (fdi: string) => void;
  onSelectTeeth: (fdis: string[]) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const SELECT_CLASS =
  "w-full h-10 px-3 py-2 bg-surface-container-lowest text-on-surface font-title-sm text-title-sm rounded-lg shadow-sm outline-none appearance-none";
const LABEL_CLASS = "font-label-sm text-label-sm text-on-surface-variant font-semibold";
const ERROR_CLASS = "font-body-sm text-body-sm text-error";

function SelectBox({ children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select className={SELECT_CLASS} {...rest}>
        {children}
      </select>
      <Icon name="expand_more" className="absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[18px]" />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-2 pb-6">
      <div className="flex items-center gap-2">
        <Link href="/orders" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="inventory_2" className="text-[16px]" />
          <span>Porudžbine</span>
        </Link>
        <span className="text-outline-variant font-data-mono text-xs">/</span>
        <span className="font-label-md text-label-md text-primary font-semibold">Nova porudžbina</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Kreiranje novog protetskog naloga</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Popunite zahteve, izaberite povezanu zubotehničku laboratoriju i priložite digitalne ili analogne otiske.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            BROJ NALOGA: #N-2024-0482
          </span>
        </div>
      </div>
    </div>
  );
}

function StepDone({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
        <Icon name="check" className="text-[20px] font-bold" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-label-sm text-label-sm uppercase text-primary font-bold tracking-wider">Korak {n}</span>
        <span className="font-title-sm text-title-sm text-on-surface font-semibold truncate">{title}</span>
      </div>
    </div>
  );
}

function StepNext({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 opacity-60">
      <div className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">{n}</div>
      <div className="flex flex-col min-w-0">
        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Korak {n}</span>
        <span className="font-title-sm text-title-sm text-on-surface font-medium truncate">{title}</span>
      </div>
    </div>
  );
}

// koraci 1 i 2 su "završeni" kad su laboratorija/pacijent izabrani; 4 i 5 se rade posle slanja (otisak na detalju)
function Stepper({ hasTechnician, hasPatient }: { hasTechnician: boolean; hasPatient: boolean }) {
  return (
    <div className="w-full bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {hasTechnician ? <StepDone n={1} title="Izbor laboratorije" /> : <StepNext n={1} title="Izbor laboratorije" />}
        {hasPatient ? <StepDone n={2} title="Izbor pacijenta" /> : <StepNext n={2} title="Izbor pacijenta" />}
        <div className="flex items-center gap-3 p-1.5 rounded-lg bg-surface-container-low shadow-sm">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-headline-sm text-title-sm font-bold shadow-md">3</div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-label-sm uppercase text-primary font-bold tracking-wider">Korak 3/5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">Stavke i radovi</span>
          </div>
        </div>
        <StepNext n={4} title="Otisak i 3D fajlovi" />
        <StepNext n={5} title="Pregled i slanje" />
      </div>
    </div>
  );
}

function ToothRow({
  teeth,
  isLower,
  selected,
  onToggle,
}: {
  teeth: MockTooth[];
  isLower: boolean;
  selected: string[];
  onToggle: (fdi: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {teeth.map((t) => {
        const isSelected = selected.includes(t.fdi);
        const cls = isSelected
          ? "w-8 sm:w-10 h-12 rounded bg-primary text-on-primary font-data-mono text-label-md flex flex-col items-center justify-center shadow-md scale-105 ring-2 ring-primary-fixed"
          : "w-8 sm:w-10 h-12 rounded bg-surface-container-lowest text-on-surface font-data-mono text-label-md flex flex-col items-center justify-center hover:bg-surface-variant transition-colors shadow-sm";
        const labelCls = isSelected ? "text-[10px] text-primary-fixed" : "text-[10px] text-on-surface-variant";
        return (
          <button key={t.fdi} type="button" className={cls} aria-pressed={isSelected} aria-label={`Zub ${t.fdi}`} onClick={() => onToggle(t.fdi)}>
            {!isLower && <span className={labelCls}>{t.label}</span>}
            <span className="font-bold">{t.fdi}</span>
            {isLower && <span className={labelCls}>{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Arch({
  teeth,
  isLower,
  selected,
  onToggle,
}: {
  teeth: { right: MockTooth[]; left: MockTooth[] };
  isLower: boolean;
  selected: string[];
  onToggle: (fdi: string) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap max-w-2xl w-full">
      <ToothRow teeth={teeth.right} isLower={isLower} selected={selected} onToggle={onToggle} />
      <div className="h-10 w-0.5 bg-outline-variant mx-1" />
      <ToothRow teeth={teeth.left} isLower={isLower} selected={selected} onToggle={onToggle} />
    </div>
  );
}

function BlockedPage({ title, description, href, linkLabel }: { title: string; description: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-col w-full">
      <Header />
      <Card>
        <EmptyState title={title} description={description} />
        <div className="mt-4 flex justify-center">
          <Link href={href} className="text-primary font-semibold hover:underline">
            {linkLabel}
          </Link>
        </div>
      </Card>
    </div>
  );
}

const QUICK_ACTION = "px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-colors";

export function NewOrderForm(props: NewOrderFormProps) {
  const { register, errors } = props;

  if (props.technicianOptions.length === 0) {
    return (
      <BlockedPage
        title="Nema povezanih laboratorija"
        description="Porudžbina je moguća samo sa laboratorijom sa kojom imate prihvaćenu vezu."
        href="/connections"
        linkLabel="Idi na veze"
      />
    );
  }
  if (props.patientOptions.length === 0) {
    return (
      <BlockedPage
        title="Nemate pacijenata"
        description="Porudžbina se pravi za pacijenta. Prvo dodaj pacijenta."
        href="/patients"
        linkLabel="Idi na pacijente"
      />
    );
  }

  const hasPatient = props.patientName !== "";
  const teethCount = props.selectedTeeth.length;
  const sortedTeeth = [...props.selectedTeeth].sort();

  return (
    <form onSubmit={props.onSubmit} className="flex flex-col w-full" noValidate>
      <Header />
      <Stepper hasTechnician={props.hasTechnician} hasPatient={hasPatient} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. Aktivni kontekst naloga */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Aktivni kontekst naloga</span>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold">
                <Icon name="edit" className="text-[16px]" />
                Izmeni izbor
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface-container-low flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                  <Icon name="biotech" className="text-[22px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <label htmlFor="technicianId" className={LABEL_CLASS}>
                    Laboratorija
                  </label>
                  <SelectBox id="technicianId" aria-invalid={!!errors.technicianId} {...register("technicianId")}>
                    <option value="">Izaberi laboratoriju</option>
                    {props.technicianOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </SelectBox>
                  {errors.technicianId?.message && (
                    <p role="alert" className={ERROR_CLASS}>
                      {errors.technicianId.message}
                    </p>
                  )}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <Icon name="schedule" className="text-[14px] text-primary" />
                    {MOCK_LAB_LEAD_TIME}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0">
                  <Icon name="person" className="text-[22px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <label htmlFor="patientId" className={LABEL_CLASS}>
                    Pacijent
                  </label>
                  <SelectBox id="patientId" aria-invalid={!!errors.patientId} {...register("patientId")}>
                    <option value="">Izaberi pacijenta</option>
                    {props.patientOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </SelectBox>
                  {errors.patientId?.message && (
                    <p role="alert" className={ERROR_CLASS}>
                      {errors.patientId.message}
                    </p>
                  )}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <Icon name="folder_shared" className="text-[14px]" />
                    Karton: <span className="font-data-mono font-medium text-on-surface">—</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FDI zubna šema — izbor zuba je lokalan, backend ga ne prima (MOCK) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">FDI Zubna šema (Odontogram)</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold tracking-wide">
                    {teethCount} {teethCount === 1 ? "Zub odabran" : "Zuba odabrano"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Kliknite na pojedinačne zube za dodeljivanje protetske nadoknade ili koristite brze akcije. Izbor zuba se za sada ne šalje laboratoriji.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" className={QUICK_ACTION} onClick={() => props.onSelectTeeth(MOCK_ALL_TEETH)}>
                  Označi celu vilicu
                </button>
                <button type="button" className={QUICK_ACTION} onClick={() => props.onSelectTeeth(MOCK_FRONT_TEETH)}>
                  Frontalna regija (13-23)
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-variant text-error font-label-sm text-label-sm font-semibold transition-colors"
                  onClick={() => props.onSelectTeeth([])}
                >
                  Poništi selekciju
                </button>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center gap-6">
              <div className="w-full flex flex-col items-center">
                <div className="flex items-center justify-between w-full max-w-2xl px-2 mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Maksila (Gornja vilica)</span>
                  <span className="font-data-mono text-[11px] text-on-surface-variant">FDI Kvadra 1 &amp; 2</span>
                </div>
                <Arch teeth={MOCK_UPPER_TEETH} isLower={false} selected={props.selectedTeeth} onToggle={props.onToggleTooth} />
              </div>
              <div className="w-full max-w-2xl flex items-center justify-center gap-3">
                <div className="h-px bg-outline-variant flex-1" />
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Okluzalna ravan</span>
                <div className="h-px bg-outline-variant flex-1" />
              </div>
              <div className="w-full flex flex-col items-center">
                <Arch teeth={MOCK_LOWER_TEETH} isLower selected={props.selectedTeeth} onToggle={props.onToggleTooth} />
                <div className="flex items-center justify-between w-full max-w-2xl px-2 mt-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Mandibula (Donja vilica)</span>
                  <span className="font-data-mono text-[11px] text-on-surface-variant">FDI Kvadra 4 &amp; 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Specifikacija radova */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Specifikacija radova i materijala</h2>
                <span className="font-data-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">{props.itemsCount} rada</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Cenovnik: {props.technicianName || "izaberi laboratoriju"}</span>
            </div>
            {errors.items?.root?.message && (
              <p role="alert" className={ERROR_CLASS}>
                {errors.items.root.message}
              </p>
            )}
            {Array.from({ length: props.itemsCount }, (_, i) => {
              const itemErrors = errors.items?.[i];
              const mode = props.itemModes[i];
              return (
                <div key={i} className="p-5 rounded-xl bg-surface-container-low flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md font-data-mono text-label-sm font-bold ${i % 2 === 0 ? "bg-primary text-on-primary" : "bg-tertiary text-on-tertiary"}`}>
                        {sortedTeeth.length > 0 ? `Zubi: ${sortedTeeth.join(", ")}` : `Rad ${i + 1}`}
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-bold">{props.itemTitles[i] || "Nova stavka"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-data-mono text-title-sm text-on-surface font-bold">{props.itemLineTotals[i] || "—"}</span>
                      <button
                        type="button"
                        disabled={props.itemsCount === 1}
                        aria-label={`Ukloni stavku ${i + 1}`}
                        onClick={() => props.onRemoveItem(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`items-${i}-mode`} className={LABEL_CLASS}>
                        Vrsta rada
                      </label>
                      <SelectBox id={`items-${i}-mode`} {...register(`items.${i}.mode`)}>
                        <option value="catalog">Iz kataloga</option>
                        <option value="free">Slobodan opis</option>
                      </SelectBox>
                    </div>
                    {mode === "catalog" ? (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label htmlFor={`items-${i}-service`} className={LABEL_CLASS}>
                          Usluga
                        </label>
                        <SelectBox
                          id={`items-${i}-service`}
                          disabled={!props.hasTechnician}
                          aria-invalid={!!itemErrors?.serviceId}
                          {...register(`items.${i}.serviceId`)}
                        >
                          <option value="">{props.hasTechnician ? "Izaberi uslugu" : "Prvo izaberi laboratoriju"}</option>
                          {props.serviceOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </SelectBox>
                        {itemErrors?.serviceId?.message && (
                          <p role="alert" className={ERROR_CLASS}>
                            {itemErrors.serviceId.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label htmlFor={`items-${i}-desc`} className={LABEL_CLASS}>
                          Opis rada
                        </label>
                        <input
                          id={`items-${i}-desc`}
                          aria-invalid={!!itemErrors?.freeDescription}
                          className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface font-title-sm text-title-sm rounded-lg shadow-sm outline-none"
                          {...register(`items.${i}.freeDescription`)}
                        />
                        {itemErrors?.freeDescription?.message && (
                          <p role="alert" className={ERROR_CLASS}>
                            {itemErrors.freeDescription.message}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`items-${i}-qty`} className={LABEL_CLASS}>
                        Količina / Jed. cena
                      </label>
                      <div className="h-10 px-3 bg-surface-container-lowest rounded-lg flex items-center justify-between gap-2 shadow-sm">
                        <input
                          id={`items-${i}-qty`}
                          type="number"
                          min={1}
                          aria-invalid={!!itemErrors?.quantity}
                          className="w-14 bg-transparent outline-none font-data-mono text-label-md font-semibold text-on-surface"
                          {...register(`items.${i}.quantity`)}
                        />
                        {mode === "free" ? (
                          <input
                            id={`items-${i}-price`}
                            inputMode="decimal"
                            placeholder="cena RSD"
                            aria-label="Cena (RSD)"
                            aria-invalid={!!itemErrors?.price}
                            className="w-24 bg-transparent outline-none text-right font-data-mono text-xs text-on-surface-variant"
                            {...register(`items.${i}.price`)}
                          />
                        ) : (
                          <span className="font-data-mono text-xs text-on-surface-variant">{props.itemUnitPrices[i] ? `@ ${props.itemUnitPrices[i]}` : "—"}</span>
                        )}
                      </div>
                      {itemErrors?.quantity?.message && (
                        <p role="alert" className={ERROR_CLASS}>
                          {itemErrors.quantity.message}
                        </p>
                      )}
                      {itemErrors?.price?.message && (
                        <p role="alert" className={ERROR_CLASS}>
                          {itemErrors.price.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* MOCK: tehnički parametri nemaju polja u šemi stavke */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" title="Uskoro">
                    {(
                      (props.itemTitles[i] ?? "").toLowerCase().includes("abutment")
                        ? ([
                            ["Subgingivalni nivo ruba", MOCK_ABUTMENT_OPTIONS.margin],
                            ["Profil izranjanja (Emergence)", MOCK_ABUTMENT_OPTIONS.emergence],
                          ] as const)
                        : ([
                            ["Boja (VITA ključ)", MOCK_SPEC_OPTIONS.shade],
                            ["Translucencija", MOCK_SPEC_OPTIONS.translucency],
                            ["Anatomski oblik", MOCK_SPEC_OPTIONS.shape],
                          ] as const)
                    ).map(([label, options]) => (
                      <div key={label} className="flex flex-col gap-1">
                        <span className={LABEL_CLASS}>{label}</span>
                        <div className="opacity-60">
                          <SelectBox disabled aria-label={label}>
                            {options.map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </SelectBox>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={props.onAddItem}
              className="w-full py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-title-sm text-title-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Icon name="add_circle" className="text-[20px]" />
              Dodaj još jednu uslugu ili slobodan opis rada
            </button>
          </div>

          {/* 4. Napomene — MOCK (kreiranje porudžbine nema polje za napomenu) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="draw" className="text-primary text-[20px]" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Posebne napomene i instrukcije</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Vidljivo zubotehničkom timu</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Navedite specifične zahteve okluzije, aproksimalnih kontakata, karakterizacije ili fiksnog termina probe. Za sada se napomena dodaje u kanalu saradnje posle slanja.
            </p>
            <textarea
              disabled
              title="Uskoro"
              rows={3}
              placeholder="Primer: Obratiti pažnju na mezijalni kontakt prema zubu 13. Pacijent ima zakazanu probu za utorak u 11h..."
              className="w-full p-4 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl outline-none placeholder:text-on-surface-variant/70 shadow-inner opacity-60"
            />
          </div>

          {/* 5. Navigacija */}
          <div className="flex items-center justify-between pt-4 pb-12">
            <Link
              href={props.patientHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm font-semibold transition-colors shadow-sm"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              Nazad na pacijenta
            </Link>
            <button
              type="submit"
              disabled={props.isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-60"
            >
              {props.isSubmitting ? "Slanje..." : "Nastavi na Otisak (Korak 4)"}
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Sticky sažetak */}
        <div className="lg:col-span-4 lg:sticky lg:top-[84px] flex flex-col gap-5">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-md flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Icon name="receipt_long" className="text-primary text-[22px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Pregled naloga</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-bold uppercase">Nacrt</span>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-body-sm font-body-sm text-on-surface-variant">
                <span>Izvršilac:</span>
                <span className="font-semibold text-on-surface text-right">{props.technicianName || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-body-sm font-body-sm text-on-surface-variant">
                <span>Pacijent:</span>
                <span className="font-semibold text-on-surface text-right">{props.patientName || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-body-sm font-body-sm text-on-surface-variant">
                <span>Broj jedinica:</span>
                <span className="font-data-mono font-bold text-on-surface">{props.unitsCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Stavke rada</span>
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: props.itemsCount }, (_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-body-md font-body-md">
                    <span className="text-on-surface">
                      {props.itemTitles[i] || "Nova stavka"} (x{props.itemQuantities[i]})
                    </span>
                    <span className="font-data-mono font-semibold text-on-surface whitespace-nowrap">{props.itemLineTotals[i] || "—"}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface">Kurirsko preuzimanje</span>
                    <span title="Ugovorna kurirska služba obuhvaćena paketom">
                      <Icon name="verified" className="text-primary text-[16px]" />
                    </span>
                  </div>
                  <span className="font-data-mono font-semibold text-primary">Besplatno</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-surface-container-high w-full" />
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-title-md text-title-md text-on-surface font-bold uppercase tracking-tight">Ukupno za radni nalog</span>
                <span className="font-headline-md text-headline-md font-bold text-primary font-data-mono whitespace-nowrap">{props.total}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Plaćanje se vrši zbirno prema mesečnom ugovoru sa {props.technicianName || "izabranom"} laboratorijom.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high flex items-start gap-3">
              <Icon name="event_available" className="text-primary text-[24px] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">Procenjeni rok isporuke</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Rok isporuke određuje laboratorija kada potvrdi porudžbinu.
                </span>
              </div>
            </div>
            {props.formError && (
              <p role="alert" className={ERROR_CLASS}>
                {props.formError}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled
                title="Uskoro"
                className="w-full py-2.5 rounded-lg bg-surface-container-low text-on-surface font-title-sm text-title-sm font-semibold flex items-center justify-center gap-2 opacity-60"
              >
                <Icon name="bookmark" className="text-[18px]" />
                Sačuvaj kao nacrt (Draft)
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
            <Icon name="encrypted" className="text-primary text-[22px] shrink-0" />
            <p className="font-body-sm text-[12px] text-on-surface-variant leading-tight">
              Svi medicinski podaci i 3D skenovi pacijenta zaštićeni su end-to-end enkripcijom u skladu sa medicinskim standardima.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
