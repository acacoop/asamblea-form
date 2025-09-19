import "./FileStatusBanner.css";
import type { Cooperativa } from "../../types/types";
import Button from "../Button/Button";
import { useEffect, useState } from "react";

interface FileStatusBannerProps {
  cooperativa: Cooperativa | null;
  archivos?: any[] | null;
  onModify?: () => void;
  onDownload?: (archivos: any[]) => void;
}

export default function FileStatusBanner({
  cooperativa,
  archivos = null,
  onModify,
  onDownload,
}: FileStatusBannerProps) {
  const [coopName, setCoopName] = useState("");

  useEffect(() => {
    // prioridad: prop cooperativa.name
    let name = cooperativa?.name || "";
    if (!name) {
      try {
        const rawCoop = localStorage.getItem("cooperativa");
        if (rawCoop) {
          const parsed = JSON.parse(rawCoop);
          name = parsed.name || parsed.nombre || name;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!name) {
      try {
        const rawForm = localStorage.getItem("formExistingData");
        if (rawForm) {
          const parsedForm = JSON.parse(rawForm);
          const datos = parsedForm.datos || {};
          // intentar distintas claves
          name =
            datos.name ||
            datos.nombre ||
            parsedForm.name ||
            parsedForm.nombre ||
            name;
        }
      } catch (e) {
        // ignore
      }
    }
    setCoopName(name || "");
  }, [cooperativa]);

  return (
    <div className="file-status-banner-overlay">
      <div className="file-status-banner">
        <h2>¡Hola!</h2>
        <h2>{coopName}</h2>
        <p>
          Se corroboró que ya existen datos cargados para el registro de la
          votación
        </p>
        <p>¿Desea modificarlos o continuar con los datos existentes?</p>
        <p>En caso de continuar puede verificarlos descargando el PDF</p>
        <div className="button-group">
          <Button
            label="Descargar archivos"
            onClick={() => {
              if (archivos && archivos.length && onDownload)
                onDownload(archivos);
            }}
            disabled={!archivos || archivos.length === 0}
          />
          <Button
            label="Modificar datos"
            color="#282d87"
            onClick={() => {
              if (onModify) onModify();
            }}
          />
        </div>
      </div>
    </div>
  );
}
