import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface DeleteServiceDialogProps {
  serviceName: string;
  isDeleting: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteServiceDialog({ serviceName, isDeleting, errorMessage, onConfirm, onCancel }: DeleteServiceDialogProps) {
  return (
    <Modal title="Brisanje usluge" onClose={onCancel}>
      <p className="mb-4 text-sm">
        Da li sigurno želiš da obrišeš uslugu <strong>{serviceName}</strong>? Radnja se ne može poništiti.
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
