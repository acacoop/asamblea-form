import "./AccessToForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authCooperativa, consultarDatos } from "../../services/services";

export default function AccessToForm() {
  const [cooperativeId, setCooperativeId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authCooperativa(cooperativeId, verificationCode);

      if (data?.cooperativa) {
        localStorage.setItem("cooperativa", JSON.stringify(data.cooperativa));

        const datos = await consultarDatos(
          data.cooperativa.code || cooperativeId
        );
        if (datos) {
          localStorage.setItem("formExistingData", JSON.stringify(datos));
        }

        navigate("/form");
      } else {
        setError("Credenciales incorrectas.");
      }
    } catch (err: any) {
      setError(err?.message || "Error en autenticación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="access-to-form" onSubmit={handleSubmit}>
      <h2 className="title-access">Ingreso de Cooperativa</h2>
      <div className="access-form-container">
        <div className="input-group">
          <label className="input-label" htmlFor="cooperativeId">
            Código de Cooperativa <span className="required">*</span> :
          </label>
          <input
            className="input-field"
            type="text"
            id="cooperativeId"
            name="cooperativeId"
            placeholder="Ej: 123"
            value={cooperativeId}
            onChange={(e) => setCooperativeId(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="verificationCode">
            Código Verificador <span className="required">*</span> :
          </label>
          <input
            className="input-field"
            type="text"
            id="verificationCode"
            name="verificationCode"
            placeholder="Ej: ABCD1234"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <div className="access-error">{error}</div>}

      <button className="access-button" type="submit" disabled={loading}>
        {loading ? "Verificando..." : "Acceder al formulario"}
      </button>
    </form>
  );
}
