import { useEffect, useMemo, useState } from "react";
import { consultarDatos } from "../services/services";
import { parseMaybeJsonArray } from "../types/types";
import type { ConsultaDatosResponse } from "../types/types";

export type PrecargaForm = {
  nombre?: string;
  apellido?: string;
  edad?: number | ""; // si no hay dato: ""
  email?: string;
  intereses?: string[]; // si aplicara
  genero?: string; // si aplicara
};

export function usePrecargaCoop(codigoCooperativa?: string) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState<PrecargaForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!codigoCooperativa) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await consultarDatos(codigoCooperativa);
        // Puede venir success:false o 404 (tu service devuelve null en 404)
        if (!resp || ("success" in resp && !resp.success)) {
          setInitial(null);
          return;
        }
        const datos = (
          resp as Extract<ConsultaDatosResponse, { success: true }>
        ).datos;

        // Normalizamos listas (pueden venir como string JSON, tal como pasa en tu flujo vanilla) :contentReference[oaicite:3]{index=3}
        const titulares = parseMaybeJsonArray(datos.titulares);
        // const suplentes = parseMaybeJsonArray(datos.suplentes); // si te hace falta
        // const cartasPoder = parseMaybeJsonArray(datos.cartasPoder); // si te hace falta

        // Tomar primer titular para precargar nombre/apellido (ajustá a tu gusto)
        let nombre: string | undefined;
        let apellido: string | undefined;
        if (titulares.length > 0 && titulares[0]?.nombre) {
          // Partimos por espacio como heurística (simple)
          const parts = String(titulares[0].nombre).trim().split(/\s+/);
          nombre = parts[0];
          apellido = parts.slice(1).join(" ") || "";
        }

        const precarga: PrecargaForm = {
          nombre,
          apellido,
          email: datos.contacto?.correoElectronico,
          edad: "", // no viene en el JSON; lo dejamos vacío
          // intereses / genero: también quedarían vacíos si no vienen
        };

        if (!cancelled) setInitial(precarga);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error al consultar datos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [codigoCooperativa]);

  return useMemo(
    () => ({ loading, initial, error }),
    [loading, initial, error]
  );
}
