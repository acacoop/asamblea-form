import "./FormGroup.css";
import Input from "../Input/Input";
import Papa from "papaparse";
import { useEffect, useState } from "react";

type RecordRow = { id: string; nombre: string; edad: string; email: string };

export default function FormGroup() {
  const [records, setRecords] = useState<RecordRow[]>([]);

  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [edad, setEdad] = useState<number | "">("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const csvUrl = new URL("../../data/example.csv", import.meta.url).href;
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as any[]).map((r, idx) => ({
          id: r.id ?? String(idx),
          nombre: r.nombre ?? "",
          edad: r.edad ?? "",
          email: r.email ?? "",
        }));
        setRecords(parsed as RecordRow[]);
      },
      error: (err) => console.error("Error parsing CSV", err),
    });
  }, []);

  return (
    <div className="form-group-container">
      <div className="form-group">
        <Input
          label="Buscar persona"
          name="buscar_persona"
          type="search"
          options={records.map((r, idx) => ({
            label: `${r.nombre} — ${r.email}`,
            value: String(idx),
          }))}
          placeholder="Buscar por nombre o email..."
          onChange={(v) => {
            if (typeof v === "string") {
              const idx = Number(v);
              if (!Number.isNaN(idx) && records[idx]) {
                const rec = records[idx];
                setNombre(rec.nombre);
                setEdad(rec.edad ? Number(rec.edad) : "");
                setEmail(rec.email);
              }
            }
          }}
        />
      </div>

      <div className="form-group">
        <Input
          label="Nombre"
          name="nombre"
          required
          value={nombre}
          onChange={(v) => setNombre(String(v))}
        />
        <Input
          label="Apellido"
          name="apellido"
          required
          value={apellido}
          onChange={(v) => setApellido(String(v))}
        />
      </div>

      <div className="form-group">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="ejemplo@correo.com"
          required
          value={email}
          onChange={(v) => setEmail(String(v))}
        />

        <Input
          label="Edad"
          name="edad"
          type="number"
          placeholder="18"
          value={edad}
          onChange={(v) => setEdad(v === "" ? "" : Number(v))}
        />
      </div>

      <div className="form-group">
        <Input
          label="Intereses"
          name="intereses"
          type="checkbox"
          options={[
            { label: "Deportes", value: "deportes" },
            { label: "Música", value: "musica" },
            { label: "Cine", value: "cine" },
          ]}
          onChange={(v) => console.log("intereses", v)}
        />
      </div>

      <div className="form-group">
        <Input
          label="Género"
          name="genero"
          type="radio"
          options={[
            { label: "Femenino", value: "f" },
            { label: "Masculino", value: "m" },
            { label: "Otro", value: "o" },
          ]}
          onChange={(v) => console.log("genero", v)}
        />
      </div>
    </div>
  );
}
