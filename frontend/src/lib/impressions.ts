// ogledalo backend pravila iz middleware/upload.ts (ekstenzije i limit) — menjati na oba mesta
export const IMPRESSION_EXTENSIONS = [".stl", ".ply", ".obj", ".pdf", ".jpg", ".jpeg", ".png", ".zip"];
export const IMPRESSION_MAX_BYTES = 200 * 1024 * 1024;

// vraća poruku o grešci ili undefined ako je fajl u redu
export function validateImpressionFile(file: { name: string; size: number }): string | undefined {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!IMPRESSION_EXTENSIONS.includes(extension)) {
    return `Nedozvoljen tip fajla. Dozvoljeno: ${IMPRESSION_EXTENSIONS.join(" ")}`;
  }
  if (file.size > IMPRESSION_MAX_BYTES) return "Fajl je veći od 200 MB";
  return undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
