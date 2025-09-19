import "./FileStatusBanner.css";
import type { Cooperativa } from "../../types/types";
import Button from "../Button/Button";
import { useEffect, useState } from "react";

interface FileStatusBannerProps {
  cooperativa: Cooperativa | null;
  archivos?: any[] | null;
  onModify?: () => void;
  onDownload?: (archivos: any[]) => void;
  open?: boolean;
  onCloseEnd?: () => void;
}

export default function FileStatusBanner({
  cooperativa,
  archivos = null,
  onModify,
  onDownload,
  open = true,
  onCloseEnd,
}: FileStatusBannerProps) {
  const [coopName, setCoopName] = useState("");
  const [render, setRender] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      setExiting(false);
    } else if (!open && render) {
      setExiting(true);
      const t = setTimeout(() => {
        setRender(false);
        setExiting(false);
        if (onCloseEnd) onCloseEnd();
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open, render, onCloseEnd]);

  useEffect(() => {
    let name = cooperativa?.name || "";
    if (!name) {
      try {
        const rawCoop = localStorage.getItem("cooperativa");
        if (rawCoop) {
          const parsed = JSON.parse(rawCoop);
          name = parsed.name || parsed.nombre || name;
        }
      } catch (e) {}
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
      } catch (e) {}
    }
    setCoopName(name || "");
  }, [cooperativa]);

  if (!render) return null;

  return (
    <div
      className={`file-status-banner-overlay ${
        open && !exiting ? "enter" : "exit"
      }`}
    >
      <div
        className={`file-status-banner ${open && !exiting ? "enter" : "exit"}`}
      >
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
