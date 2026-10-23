"use client";

import { useEffect, useState } from "react";

// samo za dev: menja CSS promenljive teme uzivo (vidi tokene u app/globals.css) i pamti izbor u localStorage
const TOKENS = [
  { key: "--primary", label: "Primary", fallback: "#16a34a" },
  { key: "--primary-dark", label: "Primary dark", fallback: "#2c4a3e" },
  { key: "--surface-tint", label: "Surface tint", fallback: "#f0faf3" },
  { key: "--accent", label: "Accent (CTA)", fallback: "#86efac" },
] as const;

// gotove palete: primarna + sumska + menta + lime (ucitavaju se jednim klikom)
const PRESETS = [
  { name: "Zelena", primary: "#16a34a", dark: "#2c4a3e", tint: "#f0faf3", accent: "#86efac" },
  { name: "Smaragd", primary: "#059669", dark: "#134e4a", tint: "#ecfdf5", accent: "#6ee7b7" },
  { name: "Teal", primary: "#0d9488", dark: "#134e4a", tint: "#f0fdfa", accent: "#5eead4" },
  { name: "Plava", primary: "#2563eb", dark: "#1e3a8a", tint: "#eff6ff", accent: "#93c5fd" },
  { name: "Ljubicasta", primary: "#9333ea", dark: "#3b0764", tint: "#faf5ff", accent: "#d8b4fe" },
] as const;

const STORAGE_KEY = "dz-theme";

type Theme = Record<string, string>;

function normalizeHex(input: string): string {
  let v = input.trim().toLowerCase();
  if (!v) return "";
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9a-f]{3}$/.test(v)) v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return /^#[0-9a-f]{6}$/.test(v) ? v : "";
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// iz jedne (primary) boje izvodi ostale uloge: ista nijansa (hue), druga svetlina/zasicenost
function deriveFromPrimary(primary: string): Theme {
  const { h, s } = hexToHsl(primary);
  return {
    "--primary": primary,
    "--primary-dark": hslToHex(h, Math.min(s, 0.35), 0.24),
    "--surface-tint": hslToHex(h, Math.min(s, 0.6), 0.96),
    "--accent": hslToHex(h, Math.min(s + 0.1, 0.85), 0.78),
  };
}

function readTheme(): Theme {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Theme;
  } catch {
    return {};
  }
}

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>({});
  // tekst iz hex polja dok korisnik kuca (ne primenjuje se dok nije validan hex)
  const [hexInput, setHexInput] = useState<Theme>({});

  // primeni sacuvanu temu pri ucitavanju
  useEffect(() => {
    const saved = readTheme();
    for (const [key, value] of Object.entries(saved)) {
      document.documentElement.style.setProperty(key, value);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage je dostupan tek na klijentu
    setTheme(saved);
  }, []);

  // Escape zatvara panel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function save(next: Theme) {
    setTheme(next);
    setHexInput({});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage moze biti nedostupan (privatni prozor) — tema radi i bez trajnog cuvanja
    }
  }

  function apply(values: Theme) {
    for (const [key, value] of Object.entries(values)) {
      document.documentElement.style.setProperty(key, value);
    }
    save({ ...theme, ...values });
  }

  function change(key: string, value: string) {
    const hex = normalizeHex(value);
    if (hex) apply({ [key]: hex });
  }

  function reset() {
    for (const { key } of TOKENS) document.documentElement.style.removeProperty(key);
    setTheme({});
    setHexInput({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // vidi gore
    }
  }

  const current = (key: string, fallback: string) => theme[key] ?? fallback;

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="Tema (dev)"
          className="w-72 rounded-2xl border border-black/10 bg-white p-4 text-foreground shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <strong>Tema (dev)</strong>
            <button onClick={() => setIsOpen(false)} aria-label="Zatvori" className="text-muted">
              ✕
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2" aria-label="Gotove palete">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`Paleta ${p.name}`}
                onClick={() =>
                  apply({
                    "--primary": p.primary,
                    "--primary-dark": p.dark,
                    "--surface-tint": p.tint,
                    "--accent": p.accent,
                  })
                }
                className="size-8 rounded-full border-2 border-white shadow ring-1 ring-black/10"
                style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.dark} 50%)` }}
              />
            ))}
          </div>

          <div className="space-y-2">
            {TOKENS.map(({ key, label, fallback }) => {
              const value = current(key, fallback);
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="w-24 shrink-0">{label}</span>
                  <input
                    value={hexInput[key] ?? value}
                    onChange={(e) => {
                      setHexInput({ ...hexInput, [key]: e.target.value });
                      change(key, e.target.value);
                    }}
                    onBlur={() => setHexInput({})}
                    aria-label={`${label} hex`}
                    className="w-20 rounded border border-black/10 px-2 py-1 font-mono text-xs"
                  />
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => change(key, e.target.value)}
                    aria-label={`${label} boja`}
                    className="h-8 w-10 cursor-pointer rounded border border-black/10 bg-transparent"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => apply(deriveFromPrimary(current("--primary", "#16a34a")))}
            className="mt-3 w-full rounded-full bg-primary py-1.5 text-white hover:bg-primary-hover"
          >
            Izvedi ostale iz Primary
          </button>
          <button onClick={reset} className="mt-2 w-full rounded-full border border-black/10 py-1.5 hover:bg-black/5">
            Vrati podrazumevano
          </button>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="rounded-full bg-primary-dark px-4 py-2 text-white shadow-lg">
          🎨 Tema
        </button>
      )}
    </div>
  );
}
