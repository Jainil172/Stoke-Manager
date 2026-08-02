import { FiAlertTriangle } from "react-icons/fi";
import Modal from "./Modal.jsx";
import Button from "../ui/Button.jsx";

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={
            tone === "danger"
              ? "grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-danger"
              : "grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-secondary"
          }
        >
          <FiAlertTriangle size={26} />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
