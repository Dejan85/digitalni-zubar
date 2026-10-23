import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface DeletePatientDialogProps {
  patientName: string;
  isDeleting: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePatientDialog({ patientName, isDeleting, errorMessage, onConfirm, onCancel }: DeletePatientDialogProps) {
  return (
    <Modal title="Brisanje pacijenta" onClose={onCancel}>
      <p className="mb-4 text-sm">
        Da li sigurno želiš da obrišeš pacijenta <strong>{patientName}</strong>? Radnja se ne može poništiti.
      </p>
      {errorMessage && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {errorMessage}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Otkaži
        </Button>
        <Button variant="dark" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Brisanje..." : "Obriši"}
        </Button>
      </div>
    </Modal>
  );
}
