import "./Form.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";
import FormGroup from "../../components/FormGroup/FormGroup";
import { useEffect, useState } from "react";
import type { Cooperativa } from "../../types/types";
import FileStatusBanner from "../../components/FileStatusBanner/FileStatusBanner";

import {
  downloadGeneratedDocument,
  extractFormDataAsJSON,
  transformFormDataToSchema,
} from "../../utils/formDataExtractor";
import { guardarFormulario } from "../../services/services";

function normalizeCooperativa(raw: any): Cooperativa {
  if (!raw) return { code: "" } as Cooperativa;
  const mapped: Cooperativa = {
    code: raw.code ?? raw.codigo ?? "",
    name: raw.name ?? raw.nombre ?? undefined,
    votes: raw.votes ?? raw.votos ?? undefined,
    substitutes: raw.substitutes ?? raw.suplentes ?? undefined,
    CAR: raw.CAR ?? raw.car ?? undefined,
    "CAR Nombre": (raw["CAR Nombre"] ?? raw.carNombre) as any,
    ...raw,
  };
  return mapped;
}



const DocumentTestButtons = () => (
  <div style={{ margin: "20px", textAlign: "center" }}>
    <button className="button" onClick={async () => {
        await downloadGeneratedDocument().then((resp) => {
          console.log("Documento generado:", resp);
        }).catch((err) => {
          console.error("Error al generar el documento:", err);
        });
        const dataSchema = transformFormDataToSchema();
        console.log("Datos extraídos para envío:", dataSchema);

        await guardarFormulario(dataSchema).then((resp) => {
          console.log("Respuesta del servidor:", resp);
        }).catch((err) => {
          console.error("Error al enviar el formulario:", err);
        });
      }
      }>
      Enviar formulario
    </button>
  </div>
);

export default function Form() {
  const [cooperativaSeleccionada, setCooperativaSeleccionada] =
    useState<Cooperativa | null>(null);
  const [showFileStatusBanner, setShowFileStatusBanner] = useState(false);
  const [archivosExistentes, setArchivosExistentes] = useState<any[] | null>(
    null
  );

  useEffect(() => {
    try {
      const rawForm = localStorage.getItem("formExistingData");
      const rawCoop = localStorage.getItem("cooperativa");

      function findPossibleCooperativa(obj: any): any {
        if (!obj || typeof obj !== "object") return null;
        if (obj.cooperativa) return obj.cooperativa;
        if (obj.datos && obj.datos.cooperativa) return obj.datos.cooperativa;
        if (
          "codigo" in obj ||
          "code" in obj ||
          "nombre" in obj ||
          "name" in obj
        )
          return obj;

        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (v && typeof v === "object") {
            if ("codigo" in v || "code" in v || "nombre" in v || "name" in v)
              return v;
          }
        }
        return null;
      }

      if (rawForm) {
        const parsedForm = JSON.parse(rawForm);

        // Detectar la existencia de un array de archivos (>0) para decidir si mostrar el banner
        function extractArchivosArray(obj: any): any[] | null {
          if (!obj || typeof obj !== "object") return null;
          // claves candidatas
          const candidates = ["archivos", "files", "documentos", "attachments"];
          for (const key of candidates) {
            const val = (obj as any)[key];
            if (Array.isArray(val)) return val;
          }
          // buscar dentro de datos si existe
          if (obj.datos) {
            for (const key of candidates) {
              const val = obj.datos[key];
              if (Array.isArray(val)) return val;
            }
          }
          return null;
        }
        try {
          const archivosArr = extractArchivosArray(parsedForm);
          const hasFiles = !!archivosArr && archivosArr.length > 0;
          setShowFileStatusBanner(hasFiles);
          setArchivosExistentes(hasFiles ? archivosArr! : null);
        } catch (e) {
          setShowFileStatusBanner(false);
          setArchivosExistentes(null);
        }
        const coopFromForm =
          findPossibleCooperativa(parsedForm) ?? parsedForm?.datos ?? null;
        // If parsedForm provides datos but no cooperativa fields, try to merge with local 'cooperativa'
        if (
          coopFromForm &&
          (coopFromForm.codigo ||
            coopFromForm.code ||
            coopFromForm.nombre ||
            coopFromForm.name)
        ) {
          const normFromForm = normalizeCooperativa(coopFromForm);
          setCooperativaSeleccionada(normFromForm);
          return;
        }

        // parsedForm has datos but lacks cooperative identification; try to take lightweight coop saved at auth
        const rawCoopFallback = localStorage.getItem("cooperativa");
        if (rawCoopFallback) {
          try {
            const parsedLocalCoop = JSON.parse(rawCoopFallback);
            const normLocal = normalizeCooperativa(parsedLocalCoop);
            // merge: local coop provides code/name, datos may still provide other metadata
            const merged = { ...normLocal, ...(coopFromForm || {}) } as any;
            setCooperativaSeleccionada(normalizeCooperativa(merged));
            return;
          } catch (err) {}
        }

        // as a last resort, try to use coopFromForm directly
        if (coopFromForm) {
          setCooperativaSeleccionada(normalizeCooperativa(coopFromForm));
          return;
        }
      }

      if (rawCoop) {
        const parsed = JSON.parse(rawCoop);
        const norm = normalizeCooperativa(parsed);
        setCooperativaSeleccionada(norm);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  return (
    <div className="form">
      <FileStatusBanner
        open={showFileStatusBanner}
        cooperativa={cooperativaSeleccionada}
        archivos={archivosExistentes || []}
        onModify={() => setShowFileStatusBanner(false)}
        onDownload={(archs) => {
          archs.forEach((a, idx) => {
            try {
              const filename = a.name || a.nombre || `archivo_${idx + 1}.pdf`;
              const rawBase64: string | undefined = a.fileContent || a.base64;
              if (!rawBase64) return;
              // limpiar posibles saltos de línea / espacios
              const cleaned = rawBase64.replace(/\s+/g, "");
              // decodificar base64 a bytes
              const byteChars = atob(cleaned);
              const byteNumbers = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              // intentar detectar tipo (suponemos PDF si nombre termina en .pdf)
              const mime = filename.toLowerCase().endsWith(".pdf")
                ? "application/pdf"
                : "application/octet-stream";
              const blob = new Blob([byteArray], { type: mime });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(url), 4000);
            } catch (e) {
              // ignorar error individual y continuar con el siguiente
            }
          });
        }}
        onDownloadOne={(a, idx) => {
          try {
            const filename = a.name || a.nombre || `archivo_${idx + 1}.pdf`;
            const rawBase64: string | undefined = a.fileContent || a.base64;
            if (!rawBase64) return;
            const cleaned = rawBase64.replace(/\s+/g, "");
            const byteChars = atob(cleaned);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const mime = filename.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "application/octet-stream";
            const blob = new Blob([byteArray], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 4000);
          } catch (e) {
            // ignore single download error
          }
        }}
      />
      <div className="form-container">
        <HeaderForm titleForm="Registro de Votación" showButtonBack={true} />
        <BodyForm
          introText="Complete el siguiente formulario con sus datos personales. Los campos marcados con asterisco (*) son obligatorios."
          showCards={false}
          showButton={false}
        >
          <FormGroup cooperativa={cooperativaSeleccionada} />
          <DocumentTestButtons />
        </BodyForm>
        <Footer />
      </div>
    </div>
  );
}
