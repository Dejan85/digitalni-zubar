export type Theme = "light" | "dark";

const STORAGE_KEY = "dz_theme";

// izvršava se pre prvog painta (inline u <head>), da nema bljeska pogrešne teme
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}`;

// izvor istine je atribut na <html>; pretplate služe useSyncExternalStore-u
const listeners = new Set<() => void>();

export function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  return () => void listeners.delete(callback);
}

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function writeTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* bez perzistencije izbor važi do reload-a */
  }
  listeners.forEach((callback) => callback());
}
