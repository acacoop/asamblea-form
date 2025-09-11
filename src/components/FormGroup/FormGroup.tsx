// components/FormGroup/FormGroup.tsx
import "./FormGroup.css";
import Input from "../Input/Input";
import { useEffect, useState } from "react";
import type { Cooperativa } from "../../types/types";

type Props = {
  cooperativa?: Cooperativa | null; // <- recibimos la coop autenticada
};

export default function FormGroup({ cooperativa }: Props) {
  const [coopNombre, setCoopNombre] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [carTexto, setCarTexto] = useState<string>("");
  const [votos, setVotos] = useState<number | "">("");

  const [secretario, setSecretario] = useState<string>("");
  const [presidente, setPresidente] = useState<string>("");
  const [contactoEmail, setContactoEmail] = useState<string>("");

  // Precarga cuando llega/actualiza la cooperativa (post autenticación)
  useEffect(() => {
    if (!cooperativa) return;

    setCoopNombre(cooperativa.name ?? "");
    setCodigo(cooperativa.code ?? "");

    const car = cooperativa.CAR ?? "";
    const carNombre = (cooperativa as any)["CAR Nombre"] ?? "";
    const carLabel = car
      ? `CAR ${car}${carNombre ? ` - ${carNombre}` : ""}`
      : "";
    setCarTexto(String(carLabel));

    setVotos(
      typeof cooperativa.votes === "number"
        ? cooperativa.votes
        : cooperativa.votes
        ? Number(cooperativa.votes)
        : ""
    );

    // Autoridades y contacto (pueden venir desde formExistingData.datos)
    const autoridades =
      (cooperativa as any).autoridades ??
      (cooperativa as any).autoridad ??
      null;
    setSecretario(autoridades?.secretario ?? "");
    setPresidente(autoridades?.presidente ?? "");

    const contacto =
      (cooperativa as any).contacto ?? (cooperativa as any).contact ?? null;
    setContactoEmail(contacto?.correoElectronico ?? contacto?.email ?? "");
  }, [cooperativa]);

  return (
    <div className="form-group-container">
      <div className="form-group">
        <h2 className="title-form-group">Información de la Cooperativa</h2>

        <Input
          label="Cooperativa"
          name="cooperativa"
          value={coopNombre}
          readOnly // <- solo visual
        />
        <Input label="Código" name="codigo" value={codigo} readOnly />
        <Input label="CAR" name="car" value={carTexto} readOnly />
        <Input
          label="Votos"
          name="votos"
          type="number"
          value={votos}
          readOnly
        />
      </div>

      {(secretario || presidente || contactoEmail) && (
        <div className="notice">
          <h3>✏️ Editando registro existente</h3>
          <p>
            Se han cargado los datos previamente guardados. Puede modificarlos y
            guardar nuevamente.
          </p>
        </div>
      )}

      <div className="form-group">
        <h2 className="title-form-group">Autoridades de la Cooperativa</h2>
        <Input
          label="Nombre del Secretario:"
          name="secretario"
          value={secretario}
          onChange={(v) => setSecretario(String(v))}
        />

        <Input
          label="Nombre del Presidente:"
          name="presidente"
          value={presidente}
          onChange={(v) => setPresidente(String(v))}
        />

        <Input
          label="Correo Electrónico de Contacto:"
          name="contacto_email"
          type="email"
          value={contactoEmail}
          placeholder="ejemplo@correo.com"
          onChange={(v) => setContactoEmail(String(v))}
        />
        <p className="help-text">
          Se enviará toda la información de la votación a esta dirección
        </p>
      </div>

      <div className="form-group">
        <h2 className="title-form-group">Titulares</h2>
      </div>
    </div>
  );
}
