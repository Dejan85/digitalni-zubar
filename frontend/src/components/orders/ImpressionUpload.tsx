import { useRef, useState, type ChangeEvent, type DragEvent, type FormEventHandler } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { IMPRESSION_EXTENSIONS } from "@/lib/impressions";

type ImpressionType = "digitalni" | "analogni";

interface ImpressionUploadProps {
  type: ImpressionType;
  onTypeChange: (type: ImpressionType) => void;
  file: { name: string; size: string } | null;
  onFileSelect: (file: File | null) => void;
  note: string;
  onNoteChange: (note: string) => void;
  error?: string;
  isUploading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ImpressionUpload(props: ImpressionUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    props.onFileSelect(event.dataTransfer.files[0] ?? null);
  };

  return (
    <form onSubmit={props.onSubmit} className="mb-4 flex flex-col gap-4 rounded-xl bg-surface-tint p-4" noValidate>
      <div className="max-w-xs">
        <Field label="Vrsta otiska" htmlFor="impression-type">
          <Select
            id="impression-type"
            value={props.type}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => props.onTypeChange(e.target.value as ImpressionType)}
          >
            <option value="digitalni">Digitalni (fajl)</option>
            <option value="analogni">Analogni (napomena)</option>
          </Select>
        </Field>
      </div>

      {props.type === "digitalni" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm ${
            isDragging ? "border-primary bg-primary-soft" : "border-primary/30"
          }`}
        >
          <p>{props.file ? `${props.file.name} (${props.file.size})` : "Prevuci fajl ovde ili izaberi sa računara"}</p>
          <p className="text-xs text-muted">{IMPRESSION_EXTENSIONS.join(" ")} · do 200 MB</p>
          <input
            ref={inputRef}
            type="file"
            hidden
            aria-label="Fajl otiska"
            accept={IMPRESSION_EXTENSIONS.join(",")}
            onChange={(e) => props.onFileSelect(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            Izaberi fajl
          </Button>
        </div>
      )}

      <Field label={props.type === "analogni" ? "Napomena (obavezno)" : "Napomena (opciono)"} htmlFor="impression-note">
        <Input
          id="impression-note"
          value={props.note}
          aria-invalid={!!props.error}
          onChange={(e: ChangeEvent<HTMLInputElement>) => props.onNoteChange(e.target.value)}
        />
      </Field>

      {props.error && (
        <p role="alert" className="text-xs text-danger">
          {props.error}
        </p>
      )}
      <div>
        <Button type="submit" variant="accent" disabled={props.isUploading}>
          {props.isUploading ? "Otpremanje..." : "Dodaj otisak"}
        </Button>
      </div>
    </form>
  );
}
