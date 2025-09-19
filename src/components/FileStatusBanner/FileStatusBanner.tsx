import "./FileStatusBanner.css";
import type { Cooperativa } from "../../types/types";
import Button from "../Button/Button";
import IconDownload from "../../assets/download.svg";
import { useEffect, useState } from "react";

interface FileStatusBannerProps {
  cooperativa: Cooperativa | null;
  archivos?: any[] | null;
  onModify?: () => void;
  onDownload?: (archivos: any[]) => void;
  onDownloadOne?: (archivo: any, index: number) => void;
  open?: boolean;
  onCloseEnd?: () => void;
}

export default function FileStatusBanner({
  cooperativa,
  archivos = null,
  onModify,
  onDownload,
  onDownloadOne,
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
        {archivos && archivos.length > 0 && (
          <div className="file-status-banner-filelist">
            <p style={{ fontWeight: 600, marginTop: 10, marginBottom: 6 }}>
              Archivos disponibles:
            </p>
            <ul>
              {archivos.map((f, i) => {
                const display = f.name || f.nombre || `archivo_${i + 1}`;
                return (
                  <li
                    key={i}
                    className={onDownloadOne ? "file-clickable" : undefined}
                    onClick={() => onDownloadOne && onDownloadOne(f, i)}
                    title={onDownloadOne ? "Descargar este archivo" : undefined}
                    aria-label={`Descargar ${display}`}
                    role={onDownloadOne ? "button" : undefined}
                  >
                    <img
                      src={IconDownload}
                      alt="Descargar"
                      className="icon-download"
                      draggable={false}
                    />
                    <span className="file-name-text">{display}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
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
