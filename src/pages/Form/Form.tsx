import "./Form.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";
import FormGroup from "../../components/FormGroup/FormGroup";
import { useEffect, useState } from "react";
import type { Cooperativa } from "../../types/types";

import { processFormSubmission, downloadGeneratedDocument, extractFormDataAsJSON } from "../../utils/formDataExtractor";

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
  <div style={{margin: "20px", textAlign: "center"}}>
    <button onClick={() => console.log(extractFormDataAsJSON())}>
      Log JSON Data
    </button>
    <button onClick={() => downloadGeneratedDocument()}>
      Download Document
    </button>
  </div>
);

export default function Form() {
  const [cooperativaSeleccionada, setCooperativaSeleccionada] =
    useState<Cooperativa | null>(null);

  useEffect(() => {
    try {
      const rawForm = localStorage.getItem("formExistingData");
      const rawCoop = localStorage.getItem("cooperativa");

      function findPossibleCooperativa(obj: any): any {
        if (!obj || typeof obj !== "object") return null;
        if (obj.cooperativa) return obj.cooperativa;
        if (obj.datos && obj.datos.cooperativa) return obj.datos.cooperativa;
        // If object itself looks like a cooperativa
        if (
          "codigo" in obj ||
          "code" in obj ||
          "nombre" in obj ||
          "name" in obj
        )
          return obj;
        // search first-level properties for a cooperativa-like object
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
      <div className="form-container">
        <HeaderForm titleForm="Registro de Votación" showButtonBack={true} />
        <BodyForm
          introText="Complete el siguiente formulario con sus datos personales. Los campos marcados con asterisco (*) son obligatorios."
          showCards={false}
          showButton={true}
          buttonLabel="Enviar formulario"
        >
          <FormGroup cooperativa={cooperativaSeleccionada} />
          <DocumentTestButtons />
        </BodyForm>
        <Footer />
      </div>
    </div>
  );
}
