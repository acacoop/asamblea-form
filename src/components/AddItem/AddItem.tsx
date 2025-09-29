import NotificationToast from "../NotificationToast/NotificationToast";
import "./AddItem.css";
import { useState } from "react";

type Props = {
  initial?: { id?: string; nombre?: string; documento?: string };
  onAdd?: (item: { id: string; nombre: string; documento?: string }) => void;
  onRemove?: (id: string) => void;
  onClose?: () => void;
  mode?: "add" | "view";
  onEdit?: (item: { id: string; nombre: string; documento?: string }) => void;
};

export default function AddItem({
  initial,
  onAdd,
  onRemove,
  onClose,
  onEdit,
}: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [documento, setDocumento] = useState(initial?.documento ?? "");
  const [documentoError, setDocumentoError] = useState(false);
  const [nombreError, setNombreError] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("error");

  function handleAdd() {
    const id = initial?.id ?? Math.random().toString(36).slice(2, 10);
    
    const documentoRegex = /^\d{8}$/;
    let hasErrors = false;

    if ((nombre.trim() === "" || nombre == null) && (documento == null || documento.trim() === "")) {
      setNombreError(true);
      setDocumentoError(true);
      setToastMessage("El nombre y el documento no pueden estar vacíos");
      setToastType("error");
      setToastOpen(true);
      hasErrors = true;
      return;
    } else {
      setNombreError(false);
      setDocumentoError(false);
    }

    if (nombre.trim() === "" || nombre == null) {
      setNombreError(true);
      setToastMessage("El nombre no puede estar vacío");
      setToastType("error");
      setToastOpen(true);
      hasErrors = true;
    } else {
      setNombreError(false);
    }


    if (documento == null || documento.trim() === "") {
      setDocumentoError(true);
      setToastMessage("El documento no puede estar vacío");
      setToastType("error");
      setToastOpen(true);
      hasErrors = true;
    } else if (!documentoRegex.test(documento.trim())) {
      setDocumentoError(true);
      setToastMessage("El documento debe contener exactamente 8 números");
      setToastType("error");
      setToastOpen(true);
      return;
    } else {
      setDocumentoError(false);
    }

    if (hasErrors) return;

    if (onAdd) onAdd({ id, nombre, documento });
    if (onClose) onClose();

  }

  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNombre(e.target.value);
    if (nombreError) setNombreError(false);
  }

  function handleDocumentoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDocumento(e.target.value);
    if (documentoError) setDocumentoError(false);
  }

  function handleRemove() {
    if (!initial?.id) return;
    if (onRemove) onRemove(initial.id);
    if (onClose) onClose();
  }

  function handleBlurEdit() {
    if (!initial?.id) return;
    if (onEdit) onEdit({ id: initial.id, nombre, documento });
  }

  return (
    <div className="add-item">
      <div className="add-item-container">
        <label className="input-label">Nombre Completo</label>
        <input
          className={`input-field ${nombreError ? 'input-error' : ''}`}
          type="text"
          value={nombre}
          onChange={handleNombreChange}
          onBlur={handleBlurEdit}
        />
      </div>
      <div className="add-item-container">
        <label className="input-label">Documento</label>
        <input
          className={`input-field ${documentoError ? 'input-error' : ''}`}
          type="text"
          value={documento}
          onChange={handleDocumentoChange}
          onBlur={handleBlurEdit}
        />
      </div>

      <div className="add-item-actions">
        {initial?.id ? (
          <button
            className="add-item-button remove"
            type="button"
            onClick={handleRemove}
          >
            Eliminar
          </button>
        ) : (
          <>
            <button
              className="add-item-button save"
              type="button"
              onClick={handleAdd}
              //disabled={
              //  nombre.trim() === "" && 
              //  documento.trim() === "" && 
              //  !/^\d{8}$/.test(documento.trim())
              //}
            >
              Guardar
            </button>
          </>
        )}
        <NotificationToast
          isOpen={toastOpen}
          message={toastMessage}
          type={toastType}
          onClose={() => setToastOpen(false)}
        />
      </div>
    </div>
  );
}
