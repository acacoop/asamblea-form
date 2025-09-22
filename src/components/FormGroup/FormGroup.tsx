// components/FormGroup/FormGroup.tsx
import "./FormGroup.css";
import Input from "../Input/Input";
import AddItem from "../AddItem/AddItem";
import { useEffect, useState } from "react";
import Button from "../Button/Button";
import CartaPoder from "../CartaPoder/CartaPoder";
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

  // titulares & suplentes
  const [titulares, setTitulares] = useState<
    Array<{ id: string; nombre: string; documento?: string }>
  >([]);
  const [suplentesArr, setSuplentesArr] = useState<
    Array<{ id: string; nombre: string; documento?: string }>
  >([]);

  // control showing an AddItem empty form when user clicks "Agregar"
  const [showAddFor, setShowAddFor] = useState<null | "titular" | "suplente">(
    null
  );
  const [showCarta, setShowCarta] = useState(false);

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

    // parse posibles titulares/suplentes desde cooperativa.datos o cooperativa
    const datos = (cooperativa as any).datos ?? (cooperativa as any);

    function parseArrayField(field: any) {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallthrough
      }
      return [];
    }

    const rawTitulares = parseArrayField(
      datos?.titulares ?? (cooperativa as any).titulares
    );
    const rawSuplentes = parseArrayField(
      datos?.suplentes ?? (cooperativa as any).suplentes
    );

    const normalize = (arr: any[]) =>
      arr.map((it) => ({
        id:
          it.id ??
          it.ID ??
          it.documento ??
          Math.random().toString(36).slice(2, 10),
        nombre: it.nombre ?? it.name ?? it.fullName ?? it.nombreCompleto ?? "",
        documento:
          it.documento ?? it.document ?? it.documentoIdentidad ?? undefined,
      }));

    setTitulares(normalize(rawTitulares));
    setSuplentesArr(normalize(rawSuplentes));
  }, [cooperativa]);

  // Persist autoridades and contacto when they change
  useEffect(() => {
    if (secretario || presidente) {
      persistLists(undefined, undefined, { presidente, secretario }, undefined);
    }
  }, [secretario, presidente]);

  useEffect(() => {
    if (contactoEmail) {
      persistLists(undefined, undefined, undefined, {
        correoElectronico: contactoEmail,
      });
    }
  }, [contactoEmail]);
  function persistLists(
    updatedTitulares?: typeof titulares,
    updatedSuplentes?: typeof suplentesArr,
    updatedAutoridades?: { presidente: string; secretario: string },
    updatedContacto?: { correoElectronico: string }
  ) {
    try {
      const raw = localStorage.getItem("formExistingData");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.datos = parsed.datos ?? {};
      if (updatedTitulares) parsed.datos.titulares = updatedTitulares;
      if (updatedTitulares) parsed.titulares = updatedTitulares;
      if (updatedSuplentes) parsed.datos.suplentes = updatedSuplentes;
      if (updatedSuplentes) parsed.suplentes = updatedSuplentes;
      if (updatedAutoridades) {
        parsed.datos.autoridades = parsed.datos.autoridades ?? {};
        parsed.datos.autoridades.presidente = updatedAutoridades.presidente;
        parsed.datos.autoridades.secretario = updatedAutoridades.secretario;
      }
      if (updatedContacto) {
        parsed.datos.contacto = parsed.datos.contacto ?? {};
        parsed.datos.contacto.correoElectronico =
          updatedContacto.correoElectronico;
      }
      localStorage.setItem("formExistingData", JSON.stringify(parsed));
      // notify other components in the same window
      try {
        window.dispatchEvent(
          new CustomEvent("formExistingDataChanged", { detail: parsed })
        );
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }

  function handleAddItemTo(
    kind: "titular" | "suplente",
    item: { id: string; nombre: string; documento?: string }
  ) {
    if (kind === "titular") {
      const next = [...titulares, item];
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = [...suplentesArr, item];
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  function handleRemoveItemFrom(kind: "titular" | "suplente", id: string) {
    if (kind === "titular") {
      const next = titulares.filter((t) => t.id !== id);
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = suplentesArr.filter((s) => s.id !== id);
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  function handleUpdateItemIn(
    kind: "titular" | "suplente",
    item: { id: string; nombre: string; documento?: string }
  ) {
    if (kind === "titular") {
      const next = titulares.map((t) => (t.id === item.id ? item : t));
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = suplentesArr.map((s) => (s.id === item.id ? item : s));
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  const canAddTitular = titulares.every(
    (t) =>
      String(t.nombre).trim() !== "" && String(t.documento ?? "").trim() !== ""
  );
  const canAddSuplente = suplentesArr.every(
    (s) =>
      String(s.nombre).trim() !== "" && String(s.documento ?? "").trim() !== ""
  );

  const maxPeople =
    typeof votos === "number" && !Number.isNaN(votos) ? Math.max(0, votos) : 6;

  return (
    <div className="form-group-container">
      <div className="form-group">
        <h2 className="title-form-group">Información de la Cooperativa</h2>

        <Input
          label="Cooperativa:"
          name="cooperativa"
          value={coopNombre}
          readOnly
        />
        <Input label="Código:" name="codigo" value={codigo} readOnly />
        <Input label="CAR:" name="car" value={carTexto} readOnly />
        <Input
          label="Votos:"
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
          label="Nombre completo del Secretario:"
          name="secretario"
          value={secretario}
          required={true}
          onChange={(v) => setSecretario(String(v))}
        />

        <Input
          label="Nombre completo del Presidente:"
          name="presidente"
          required={true}
          value={presidente}
          onChange={(v) => setPresidente(String(v))}
        />

        <Input
          label="Correo Electrónico de Contacto:"
          name="contacto_email"
          type="email"
          required={true}
          value={contactoEmail}
          placeholder="ejemplo@correo.com"
          onChange={(v) => setContactoEmail(String(v))}
        />
        <p className="help-text">
          Se enviará toda la información de la votación a esta dirección
        </p>
      </div>

      <div className="form-group">
        <h2 className="title-form-group">{`Titulares (máximo ${maxPeople})`}</h2>
        {titulares.length === 0 && showAddFor !== "titular" && (
          <p className="empty">No hay titulares cargados.</p>
        )}
        {titulares.map((t) => (
          <AddItem
            key={t.id}
            initial={t}
            onEdit={(item) => handleUpdateItemIn("titular", item)}
            onRemove={(id) => handleRemoveItemFrom("titular", id)}
          />
        ))}

        {showAddFor === "titular" && titulares.length < maxPeople && (
          <div className="add-new-item">
            <AddItem
              onAdd={(item) => {
                handleAddItemTo("titular", item);
                setShowAddFor(null);
              }}
              onClose={() => setShowAddFor(null)}
            />
          </div>
        )}

        <div className="button-add-item-container">
          <Button
            label="Agregar Titular"
            onClick={() => setShowAddFor("titular")}
            color="--aca-blue-light"
            disabled={!canAddTitular || titulares.length >= maxPeople}
          />
        </div>
      </div>

      <div className="form-group">
        <h2 className="title-form-group">{`Suplentes (máximo ${maxPeople})`}</h2>
        {suplentesArr.length === 0 && showAddFor !== "suplente" && (
          <p className="empty">No hay suplentes cargados.</p>
        )}
        {suplentesArr.map((s) => (
          <AddItem
            key={s.id}
            initial={s}
            onEdit={(item) => handleUpdateItemIn("suplente", item)}
            onRemove={(id) => handleRemoveItemFrom("suplente", id)}
          />
        ))}

        {showAddFor === "suplente" && suplentesArr.length < maxPeople && (
          <div className="add-new-item">
            <AddItem
              onAdd={(item) => {
                handleAddItemTo("suplente", item);
                setShowAddFor(null);
              }}
              onClose={() => setShowAddFor(null)}
            />
          </div>
        )}

        <div className="button-add-item-container">
          <Button
            label="Agregar Suplente"
            color="--aca-blue-light"
            onClick={() => setShowAddFor("suplente")}
            disabled={!canAddSuplente || suplentesArr.length >= maxPeople}
          />
        </div>
      </div>
      <div className="form-group">
        <h2 className="title-form-group">Cartas Poder</h2>
        <p className="help-text">
          Un apoderado puede recibir hasta 2 cartas de poder.
        </p>
        <CartaPoder />

        {showCarta && (
          <div className="carta-modal">
            <CartaPoder />
            <div style={{ marginTop: 8 }}>
              <Button label="Cerrar" onClick={() => setShowCarta(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
