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
      const norm = (arr: any[]) =>
        arr.map((it) => ({
          id: it.id ?? it.ID ?? Math.random().toString(36).slice(2, 10),
          nombre:
            it.nombre ?? it.name ?? it.fullName ?? it.nombreCompleto ?? "",
          documento: it.documento ?? it.document ?? undefined,
        }));
      setTitulares(norm(rawTit));

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
    const maxCartas = Math.max(0, titulares.length - 1);
  
    if (maxCartas === 0) {
      setToastMessage("Debe cargar al menos 2 titulares para crear cartas poder.");
      setToastType("error");
      setToastOpen(true);
      return;
    }

    if (cartas.length >= maxCartas) {
      setToastMessage(`Solo se pueden crear máximo ${maxCartas} cartas poder con ${titulares.length} titulares cargados.`);
      setToastType("error");
      setToastOpen(true);
      return;
    }

    const incompleteCarta = cartas.find(carta => !carta.poderanteId || !carta.apoderadoId);
    if (incompleteCarta) {
      setToastMessage("Debe completar todas las cartas poder existentes antes de agregar una nueva.");
      setToastType("error");
      setToastOpen(true);
      return;
    }

    const id = Math.random().toString(36).slice(2, 10);
    const next = [...cartas, { id }];
    persistCartas(next);
  }

  function removeCarta(id: string) {
    const next = cartas.filter((c) => c.id !== id);
    persistCartas(next);
  }

  function updateCarta(id: string, patch: Partial<Carta>) {
    const target = cartas.find((c) => c.id === id);
    if (!target) return;

    if (patch.poderanteId && patch.poderanteId === target.apoderadoId) {
      setToastMessage("El poderdante no puede ser el mismo que el apoderado.");
      setToastType("error");
      setToastOpen(true);
      return;
    }

    if (patch.poderanteId) {
      const isApoderadoEnOtra = cartas.some(
        (c) => c.apoderadoId === patch.poderanteId && c.id !== id
      );
      if (isApoderadoEnOtra) {
        setToastMessage("Un apoderado no puede ser poderdante.");
        setToastType("error");
        setToastOpen(true);
        return;
      }
      // Regla: un titular solo puede ceder (ser poderdante) una sola vez
      const yaCedioSuVoto = cartas.some(
        (c) => c.poderanteId === patch.poderanteId && c.id !== id
      );
      if (yaCedioSuVoto) {
        setToastMessage("Este titular ya cedió su voto.");
        setToastType("error");
        setToastOpen(true);
        return;
      }
    }

    if (patch.apoderadoId) {
      const newApoderadoId = patch.apoderadoId;
      if (newApoderadoId === (patch.poderanteId ?? target.poderanteId)) {
        setToastMessage("No puede delegar el poder a sí mismo.");
        setToastType("error");
        setToastOpen(true);
        return;
      }
      const esPoderdanteEnOtra = cartas.some(
        (c) => c.poderanteId === newApoderadoId && c.id !== id
      );
      if (esPoderdanteEnOtra) {
        setToastMessage("Un apoderado no puede ser poderdante.");
        setToastType("error");
        setToastOpen(true);
        return;
      }
      const count = cartas.reduce((acc, cur) => {
        if (cur.id === id) return acc;
        if (cur.apoderadoId === newApoderadoId) return acc + 1;
        return acc;
      }, 0);
      if (count >= 2) {
        setToastMessage("Este titular ya recibió 2 delegaciones.");
        setToastType("error");
        setToastOpen(true);
        return;
      }
    }

    const next = cartas.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persistCartas(next);
  }

  const apoderadoCounts: Record<string, number> = cartas.reduce((acc, cur) => {
    if (cur.apoderadoId) {
      acc[cur.apoderadoId] = (acc[cur.apoderadoId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

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
            <label className="input-label">
              Poderdante (titular que delega):
            </label>
            <select
              className="input-select"
              value={c.poderanteId ?? ""}
              onChange={(e) =>
                updateCarta(c.id, { poderanteId: e.target.value })
              }
            >
              <option value="">Seleccione un titular</option>
              {titulares.map((t) => {
                const isSameAsApoderado = t.id === c.apoderadoId;
                const esApoderadoGlobal = cartas.some(
                  (ct) => ct.apoderadoId === t.id && ct.id !== c.id
                );
                const esPoderdanteEnOtra = cartas.some(
                  (ct) => ct.poderanteId === t.id && ct.id !== c.id
                );
                const disabled =
                  isSameAsApoderado || esApoderadoGlobal || esPoderdanteEnOtra;
                const title = isSameAsApoderado
                  ? "El poderdante no puede ser el mismo apoderado"
                  : esApoderadoGlobal
                  ? "No puede ser poderdante porque es apoderado en otra carta"
                  : esPoderdanteEnOtra
                  ? "Este titular ya cedió su voto"
                  : undefined;
                return (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={disabled}
                    title={title}
                  >
                    {t.nombre}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="campo">
            <label className="input-label">
              Apoderado (titular que recibe):
            </label>
            <select
              className="input-select"
              value={c.apoderadoId ?? ""}
              onChange={(e) =>
                updateCarta(c.id, { apoderadoId: e.target.value })
              }
            >
              <option value="">Seleccione un titular</option>
              {titulares.map((t) => {
                const count = apoderadoCounts[t.id] || 0;
                const isAlreadyAssignedToThisCarta = t.id === c.apoderadoId;
                const isSameAsPoderante = t.id === c.poderanteId;
                const esPoderdanteGlobal = cartas.some(
                  (ct) => ct.poderanteId === t.id && ct.id !== c.id
                );
                const isDisabled =
                  (count >= 2 && !isAlreadyAssignedToThisCarta) ||
                  isSameAsPoderante ||
                  esPoderdanteGlobal;
                let title: string | undefined;
                if (isSameAsPoderante) title = "No puede delegar a sí mismo";
                else if (esPoderdanteGlobal)
                  title =
                    "No puede ser apoderado porque es poderdante en otra carta";
                else if (count >= 2 && !isAlreadyAssignedToThisCarta)
                  title = "Este titular ya recibió 2 delegaciones";
                return (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={isDisabled}
                    title={title}
                  >
                    {t.nombre}
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
