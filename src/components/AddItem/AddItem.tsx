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

  function handleAdd() {
    const id = initial?.id ?? Math.random().toString(36).slice(2, 10);
    if (onAdd) onAdd({ id, nombre, documento });
    if (onClose) onClose();
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
          className="input-field"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={handleBlurEdit}
        />
      </div>
      <div className="add-item-container">
        <label className="input-label">Documento</label>
        <input
          className="input-field"
          type="number"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
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
              disabled={
                String(nombre).trim() === "" || String(documento).trim() === ""
              }
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
