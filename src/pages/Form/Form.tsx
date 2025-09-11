import "./Form.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";
import FormGroup from "../../components/FormGroup/FormGroup";
import { useEffect, useState } from "react";
import type { Cooperativa } from "../../types/types";

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

export default function Form() {
  const [cooperativaSeleccionada, setCooperativaSeleccionada] =
    useState<Cooperativa | null>(null);

  useEffect(() => {
    try {
      // First try to use the richer cached response from consultarDatos
      const rawForm = localStorage.getItem("formExistingData");
      if (rawForm) {
        const parsedForm = JSON.parse(rawForm);
        // parsedForm may be { success: true, datos: { cooperativa: {...}, ... } }
        // or the API might return the full payload with a top-level `cooperativa`.
        const coopFromForm =
          parsedForm?.cooperativa ??
          parsedForm?.datos?.cooperativa ??
          parsedForm;
        const normFromForm = normalizeCooperativa(coopFromForm);
        setCooperativaSeleccionada(normFromForm);
        return;
      }

      // fallback to the lightweight cooperativa stored after auth
      const raw = localStorage.getItem("cooperativa");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const norm = normalizeCooperativa(parsed);
      setCooperativaSeleccionada(norm);
    } catch (e) {
      // si hay error al parsear, dejamos null
      console.warn("No se pudo parsear cooperativa desde localStorage", e);
    }
  }, []);

  return (
    <div className="form">
      <div className="form-container">
        <HeaderForm titleForm="Formulario" showButtonBack={true} />
        <BodyForm
          introText="Complete el siguiente formulario con sus datos personales. Los campos marcados con asterisco (*) son obligatorios."
          showCards={false}
          showButton={true}
          buttonLabel="Enviar formulario"
        >
          <FormGroup cooperativa={cooperativaSeleccionada} />
        </BodyForm>
        <Footer />
      </div>
    </div>
  );
}
