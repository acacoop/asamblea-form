import { useState, type FormEvent } from "react";
import "./Login.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const AUTH_METRICS_ENDPOINT =
        "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0db163cd42914fcb9e12abcb70205e35/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=33_XarL2mOtEhlaJo665zQZ2x0Hf6M2ArZH66kLQCgk";

      const response = await fetch(AUTH_METRICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      console.log("🔐 Respuesta de autenticación:", response.status);

      if (response.status === 200) {
        // Autenticación exitosa
        console.log("✅ Autenticación exitosa");
        
        // Guardar token en sessionStorage (se borra al cerrar el navegador)
        const authToken = btoa(`${usuario}:${Date.now()}`); // Token simple
        sessionStorage.setItem("metrics_auth_token", authToken);
        sessionStorage.setItem("metrics_auth_user", usuario);
        
        onLoginSuccess();
      } else {
        // Error de autenticación
        const errorData = await response.text();
        console.error("❌ Error de autenticación:", errorData);
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("❌ Error en la petición:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🔒 Acceso a Métricas</h1>
          <p>Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !usuario || !password}
          >
            {loading ? "🔄 Verificando..." : "🔐 Ingresar"}
          </button>
        </form>

        <div className="login-footer">
          <p>Acceso restringido solo para personal autorizado</p>
        </div>
      </div>
    </div>
  );
}
