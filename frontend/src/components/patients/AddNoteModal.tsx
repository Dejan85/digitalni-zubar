import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

interface AddNoteModalProps {
  noteField: UseFormRegisterReturn;
  errorMessage?: string;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

// forma za ručnu belešku pacijenta; otvara se iz kartice "Nadležni stomatolog" ("Dodaj belešku")
export function AddNoteModal(props: AddNoteModalProps) {
  return (
    <Modal title="Nova beleška" onClose={props.onClose}>
      <form onSubmit={props.onSubmit} className="flex flex-col gap-3" noValidate>
        <Input
          placeholder="Nova beleška..."
          aria-label="Tekst beleške"
          aria-invalid={!!props.errorMessage}
          autoFocus
          {...props.noteField}
        />
        {props.errorMessage && <p className="text-xs text-danger">{props.errorMessage}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={props.onClose}>
            Odustani
          </Button>
          <Button type="submit" variant="accent" disabled={props.isSubmitting}>
            Dodaj
          </Button>
        </div>
      </form>
    </Modal>
  );
}
