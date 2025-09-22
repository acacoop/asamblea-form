import "./Modal.css";
import Button from "../Button/Button";

interface ModalProps {
  open?: boolean;
  onDownload?: () => void | Promise<void>;
  downloading?: boolean;
  downloadLabel?: string;
}

export default function Modal({
  open,
  onDownload,
  downloading,
  downloadLabel,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className={`modal ${open ? "open" : ""}`}>
      <div className="content">
        <div className="check-wrapper" aria-hidden="true">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle
              className="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="checkmark__check"
              fill="none"
              d="M14 27 l7 7 17-17"
            />
          </svg>
        </div>
        <h2 className="title">Se confirmó el envío de la solicitud</h2>
        <Button
          label={downloadLabel || (downloading ? "Preparando..." : "Descargar")}
          onClick={onDownload}
          disabled={downloading}
        />
      </div>
    </div>
  );
}
