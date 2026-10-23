import { useEffect, useState } from "react";

// vrednost koja se menja tek nakon pauze u kucanju (pretraga bez zahteva na svaki karakter)
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
