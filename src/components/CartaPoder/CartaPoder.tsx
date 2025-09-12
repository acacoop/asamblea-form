import "./CartaPoder.css";
import { useEffect, useState } from "react";
import Button from "../Button/Button";
import NotificationToast from "../NotificationToast/NotificationToast";

type Person = { id: string; nombre: string; documento?: string };
type Carta = { id: string; poderanteId?: string; apoderadoId?: string };

function readFormExisting() {
  try {
    const raw = localStorage.getItem("formExistingData");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export default function CartaPoder() {
  const [titulares, setTitulares] = useState<Person[]>([]);
  const [suplentes, setSuplentes] = useState<Person[]>([]);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  useEffect(() => {
    const load = () => {
      const parsed = readFormExisting();
      const datos = parsed?.datos ?? {};
      const parse = (v: any) => {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        try {
          const p = JSON.parse(v);
          if (Array.isArray(p)) return p;
        } catch (e) {}
        return [];
      };
      const rawTit = parse(datos.titulares ?? parsed?.titulares);
      const rawSup = parse(datos.suplentes ?? parsed?.suplentes);
      const norm = (arr: any[]) =>
        arr.map((it) => ({
          id: it.id ?? it.ID ?? Math.random().toString(36).slice(2, 10),
          nombre:
            it.nombre ?? it.name ?? it.fullName ?? it.nombreCompleto ?? "",
          documento: it.documento ?? it.document ?? undefined,
        }));
      setTitulares(norm(rawTit));
      setSuplentes(norm(rawSup));

      const rawCartas = parse(datos.cartasPoder ?? parsed?.cartasPoder);
      setCartas(Array.isArray(rawCartas) ? rawCartas : []);
    };

    load();
    const h = () => load();
    window.addEventListener("formExistingDataChanged", h as any);
    return () =>
      window.removeEventListener("formExistingDataChanged", h as any);
  }, []);

  function persistCartas(next: Carta[]) {
    try {
      const raw = readFormExisting() || {};
      raw.datos = raw.datos ?? {};
      raw.datos.cartasPoder = next;
      localStorage.setItem("formExistingData", JSON.stringify(raw));
      setCartas(next);
      try {
        window.dispatchEvent(
          new CustomEvent("formExistingDataChanged", { detail: raw })
        );
      } catch (e) {}
    } catch (e) {}
  }

  function addCarta() {
    const id = Math.random().toString(36).slice(2, 10);
    const next = [...cartas, { id }];
    persistCartas(next);
  }

  function removeCarta(id: string) {
    const next = cartas.filter((c) => c.id !== id);
    persistCartas(next);
  }

  function updateCarta(id: string, patch: Partial<Carta>) {
    // validate apoderado assignment
    const target = cartas.find((c) => c.id === id);
    if (!target) return;

    // if patch contains apoderadoId, check limits
    if (patch.apoderadoId) {
      const newApoderadoId = patch.apoderadoId;
      // count current assignments excluding this carta
      const count = cartas.reduce((acc, cur) => {
        if (cur.id === id) return acc;
        if (cur.apoderadoId === newApoderadoId) return acc + 1;
        return acc;
      }, 0);

      // cannot be apoderado if selected as poderante in any carta
      const isPoderante = cartas.some((c) => c.poderanteId === newApoderadoId);
      if (isPoderante) {
        setToastMessage("Un apoderado no puede ser poderdante.");
        setToastType("error");
        setToastOpen(true);
        return;
      }

      if (count >= 2) {
        setToastMessage(
          "Este apoderado ya tiene 2 cartas, no puede recibir más."
        );
        setToastType("error");
        setToastOpen(true);
        return;
      }
    }

    const next = cartas.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persistCartas(next);
  }

  // compute how many cartas tiene cada apoderado
  const apoderadoCounts: Record<string, number> = cartas.reduce((acc, cur) => {
    if (cur.apoderadoId) {
      acc[cur.apoderadoId] = (acc[cur.apoderadoId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const apoderadosSet = new Set(Object.keys(apoderadoCounts));

  return (
    <div className="carta-poder">
      <NotificationToast
        message={toastMessage}
        type={toastType}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
      {cartas.map((c) => (
        <div key={c.id} className="add-item">
          <div className="campo">
            <label className="input-label">Poderdante (quien delega):</label>
            <select
              className="input-select"
              value={c.poderanteId ?? ""}
              onChange={(e) =>
                updateCarta(c.id, { poderanteId: e.target.value })
              }
            >
              <option value="">Seleccione un titular</option>
              {titulares.map((t) => {
                const isDisabled = apoderadosSet.has(t.id);
                const title = isDisabled
                  ? "No puede ser poderdante porque está designado como apoderado"
                  : undefined;
                return (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={isDisabled}
                    title={title}
                  >
                    {t.nombre} {t.documento ? `(${t.documento})` : null}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="campo">
            <label className="input-label">Apoderado (quien recibe):</label>
            <select
              className="input-select"
              value={c.apoderadoId ?? ""}
              onChange={(e) =>
                updateCarta(c.id, { apoderadoId: e.target.value })
              }
            >
              <option value="">Seleccione un suplente</option>
              {suplentes.map((s) => {
                const count = apoderadoCounts[s.id] || 0;
                const isAlreadyAssignedToThisCarta = s.id === c.apoderadoId;
                const isSameAsPoderante = s.id === c.poderanteId;
                const isDisabled =
                  (count >= 2 && !isAlreadyAssignedToThisCarta) ||
                  isSameAsPoderante;
                let title: string | undefined;
                if (isSameAsPoderante)
                  title = "No puede ser apoderado y poderdante al mismo tiempo";
                else if (count >= 2 && !isAlreadyAssignedToThisCarta)
                  title =
                    "Este apoderado ya tiene 2 cartas, no puede recibir más";

                return (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={isDisabled}
                    title={title}
                  >
                    {s.nombre} {s.documento ? `(${s.documento})` : null}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="actions">
            <Button
              className="add-item-button"
              label="Eliminar"
              color="--error-red"
              onClick={() => removeCarta(c.id)}
            />
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <Button
          label="AGREGAR CARTA PODER"
          color="--aca-blue-light"
          onClick={addCarta}
        />
      </div>
    </div>
  );
}
