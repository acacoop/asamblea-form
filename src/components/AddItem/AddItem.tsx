import "./AddItem.css";

export default function AddItem() {
  return (
    <div className="add-item">
      <div className="add-item-container">
        <label className="input-label">Nombre Completo</label>
        <input className="input-field" type="text" />
      </div>
      <div className="add-item-container">
        <label className="input-label">Documento</label>
        <input className="input-field" type="text" />
      </div>

      <button className="add-item-button" type="button">
        Eliminar
      </button>
    </div>
  );
}
