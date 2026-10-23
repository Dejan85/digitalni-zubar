interface ThemeSwitchProps {
  isDark: boolean;
  onToggle: () => void;
}

// mali switch (sunce/mesec) za promenu teme
export function ThemeSwitch({ isDark, onToggle }: ThemeSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Tamna tema"
      title={isDark ? "Prebaci na svetlu temu" : "Prebaci na tamnu temu"}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full border border-primary/30 transition-colors ${isDark ? "bg-primary" : "bg-primary-soft"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-card text-xs shadow transition-transform ${isDark ? "translate-x-5" : ""}`}
        aria-hidden="true"
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
