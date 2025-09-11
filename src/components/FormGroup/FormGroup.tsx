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
  const [suplentes, setSuplentes] = useState<number | "">("");

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

    setSuplentes(
      typeof cooperativa.substitutes === "number"
        ? cooperativa.substitutes
        : cooperativa.substitutes
        ? Number(cooperativa.substitutes)
        : ""
    );
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
          onChange={(v) => setCoopNombre(String(v))}
        />
        <Input
          label="Código"
          name="codigo"
          value={codigo}
          readOnly
          onChange={(v) => setCodigo(String(v))}
        />
        <Input
          label="CAR"
          name="car"
          value={carTexto}
          readOnly
          onChange={(v) => setCarTexto(String(v))}
        />
        <Input
          label="Votos"
          name="votos"
          type="number"
          value={votos}
          readOnly
          onChange={(v) => setVotos(v === "" ? "" : Number(v))}
        />
        <Input
          label="Suplentes"
          name="suplentes"
          type="number"
          value={suplentes}
          readOnly
          onChange={(v) => setSuplentes(v === "" ? "" : Number(v))}
        />
      </div>

      {/* Si más adelante querés seguir con “Autoridades”, Titulares, etc., dejalos como otra sección editable */}
      {/* ... */}
    </div>
  );
}
