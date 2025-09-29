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
  transformFormDataToSchema,
} from "../../utils/formDataExtractor";
import { guardarFormulario } from "../../services/services";
import Modal from "../../components/Modal/Modal";
import NotificationToast from "../../components/NotificationToast/NotificationToast";

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

function descargarTodos(archs: any[]) {
  archs.forEach((a: any, idx: any) => {
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
    } catch (e) {}
  });
}

function descargarArchivo(a: any, idx: any) {
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
}

function SubmitButton({
  onSubmit,
  loading,
}: {
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <button className="button" disabled={loading} onClick={onSubmit}>
        {loading ? "Enviando..." : "Enviar formulario"}
      </button>
    </div>
  );
}

export default function Form() {
  const [cooperativaSeleccionada, setCooperativaSeleccionada] =
    useState<Cooperativa | null>(null);
  const [showFileStatusBanner, setShowFileStatusBanner] = useState(false);
  const [archivosExistentes, setArchivosExistentes] = useState<any[] | null>(
    null
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nuevosArchivos, setNuevosArchivos] = useState<any[]>([]);
  const [descargando, setDescargando] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  const handleEnviarFormulario = async () => {
    if (enviando) return;

    setToastMessage("Generando archivos...");
    setToastType("info");
    setToastOpen(true);

    setEnviando(true);
    try {
      const dataSchema = transformFormDataToSchema();

      const errors = [];
    
      if (!dataSchema.titulares || dataSchema.titulares.length === 0) {
        errors.push("Titulares");
      }

      const incompleteCartas = dataSchema.cartasPoder.filter(
        (carta: any) => !carta.poderanteId || !carta.apoderadoId
      );
      if (incompleteCartas.length > 0) {
        errors.push("Cartas Poder (debe seleccionar poderdante y apoderado para todas las cartas)");
      }

      if (!dataSchema.autoridades?.presidente || dataSchema.autoridades.presidente.trim() === "") {
        errors.push("Presidente");
      }

      if (!dataSchema.autoridades?.secretario || dataSchema.autoridades.secretario.trim() === "") {
        errors.push("Secretario");
      }

      if (errors.length > 0) {
        setToastMessage(`Los siguientes campos son obligatorios: ${errors.join(", ")}`);
        setToastType("error");
        setToastOpen(true);
        setEnviando(false);
        return;
      }

      await guardarFormulario(dataSchema);
      const response = await downloadGeneratedDocument();
  
      if (response.success && response.files) {
        setNuevosArchivos(response.files);
        console.log("Archivos nuevos recibidos:", response.files);
        setToastMessage("Archivos generados con éxito.");
        setToastType("success");
        setToastOpen(true);
        setModalAbierto(true);
      } else {
        console.error("Error en la respuesta:", response.error);
        setToastMessage("Error al generar archivos.");
        setToastType("error");
        setToastOpen(true);
      }
    } catch (e) {
      console.error("Error al enviar el formulario:", e);
      setToastMessage("Error al generar archivos.");
      setToastType("error");
      setToastOpen(true);
    } finally {
      setEnviando(false);
    }
  };

  const handleDownload = async () => {
    console.log("Iniciando descarga de archivos nuevos...");
    setToastMessage("Descargando archivos...");
    setToastType("info");
    setToastOpen(true);
    if (descargando) return;
    setDescargando(true);
    try {
      console.log("Archivos a descargar:", nuevosArchivos);
      await descargarTodos(nuevosArchivos);
    } catch (e) {
      console.error("Error al obtener / descargar archivos nuevos:", e);
      setToastMessage("Error al descargar archivos.");
      setToastType("error");
      setToastOpen(true);
    } finally {
      setToastMessage("Archivos descargados con éxito.");
      setToastType("success");
      setToastOpen(true);
      setDescargando(false);
      setModalAbierto(false);
    }
  };

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

        function extractArchivosArray(obj: any): any[] | null {
          if (!obj || typeof obj !== "object") return null;

          const candidates = ["archivos", "files", "documentos", "attachments"];
          for (const key of candidates) {
            const val = (obj as any)[key];
            if (Array.isArray(val)) return val;
          }
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

        const rawCoopFallback = localStorage.getItem("cooperativa");
        if (rawCoopFallback) {
          try {
            const parsedLocalCoop = JSON.parse(rawCoopFallback);
            const normLocal = normalizeCooperativa(parsedLocalCoop);
            const merged = { ...normLocal, ...(coopFromForm || {}) } as any;
            setCooperativaSeleccionada(normalizeCooperativa(merged));
            return;
          } catch (err) {}
        }

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
          descargarTodos(archs);
        }}
        onDownloadOne={(a, idx) => {
          descargarArchivo(a, idx);
        }}
      />
      <div className="form-container">
        <HeaderForm titleForm="Registro de Votación" showButtonBack={true} />
        <BodyForm
          introText="Complete el siguiente formulario. Los campos marcados con asterisco (*) son obligatorios."
          showCards={false}
          showButton={false}
        >
          <FormGroup cooperativa={cooperativaSeleccionada} />
          <SubmitButton onSubmit={handleEnviarFormulario} loading={enviando} />
          <Modal
            open={modalAbierto}
            onDownload={handleDownload}
            downloading={descargando}
            downloadLabel={descargando ? "Generando archivos..." : undefined}
          />
        </BodyForm>
        <NotificationToast
                message={toastMessage}
                type={toastType}
                isOpen={toastOpen}
                onClose={() => setToastOpen(false)}
                duration={8000}
              />
        <Footer />
      </div>
    </div>
  );
}
