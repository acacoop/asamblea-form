import { useEffect, useState } from "react";
import "./Metrics.css";
import { obtenerMetricas } from "../../services/services";
import type { CooperativaMetrica } from "../../types/types";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import Footer from "../../components/Footer/Footer";

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<CooperativaMetrica[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "completas" | "incompletas">("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerMetricas();
      console.log("Respuesta de métricas:", response);
      if (response && response.body && response.body.value) {
        console.log("✅ Cargando", response.body.value.length, "cooperativas");
        setMetricas(response.body.value);
      } else {
        console.error("❌ No hay datos en la respuesta");
        setError("No se pudieron cargar las métricas");
      }
    } catch (e) {
      console.error("Error al cargar métricas:", e);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    // Crear filas del CSV con todos los detalles
    const csvRows: string[] = [];
    
    // Encabezados
    csvRows.push([
      "Código",
      "Localidad",
      "Nombre Cooperativa",
      "Nombre Corto",
      "CUIT",
      "Distrito Electoral",
      "Región",
      "Sucursal",
      "Votos Consec",
      "Votos Asoc",
      "Total Votos",
      "Estado Registro",
      "Fecha Registro",
      "Presidente",
      "Secretario",
      "Email Principal",
      "Email Copia",
      "Total Titulares",
      "Total Suplentes",
      "Total Cartas Poder",
      "Titulares (Nombres)",
      "Suplentes (Nombres)",
      "Cartas de Poder (Detalle)"
    ].join(","));

    // Función auxiliar para escapar valores CSV
    const escaparCSV = (valor: any): string => {
      if (valor === null || valor === undefined) return "";
      const str = String(valor);
      // Si contiene coma, salto de línea o comillas, escapar
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Función para parsear JSON y extraer nombres
    const extraerNombres = (jsonStr: string | undefined): string => {
      if (!jsonStr) return "";
      try {
        const arr = JSON.parse(jsonStr);
        if (Array.isArray(arr)) {
          return arr.map((p: any) => `${p.nombre} (${p.documento})`).join("; ");
        }
      } catch (e) {
        return "";
      }
      return "";
    };

    // Función para extraer detalle de cartas de poder
    const extraerCartasPoder = (jsonStr: string | undefined, titularesJson: string | undefined): string => {
      if (!jsonStr) return "";
      try {
        const cartas = JSON.parse(jsonStr);
        const titulares = titularesJson ? JSON.parse(titularesJson) : [];
        
        if (Array.isArray(cartas) && cartas.length > 0) {
          return cartas.map((carta: any) => {
            const poderdante = titulares.find((t: any) => t.id === carta.poderanteId);
            const apoderado = titulares.find((t: any) => t.id === carta.apoderadoId);
            return `${poderdante?.nombre || "?"} → ${apoderado?.nombre || "?"}`;
          }).join("; ");
        }
      } catch (e) {
        return "";
      }
      return "";
    };

    // Agregar datos de cada cooperativa
    metricas.forEach((coop) => {
      csvRows.push([
        escaparCSV(coop.Title),
        escaparCSV(coop.field_1),
        escaparCSV(coop.field_2),
        escaparCSV(coop.Nombre_corto),
        escaparCSV(coop.CUIT),
        escaparCSV(coop.field_7?.Value),
        escaparCSV(coop.field_5?.Value),
        escaparCSV(coop.field_8?.Value),
        escaparCSV(coop.VotosConsec),
        escaparCSV(coop.VotosAsoc),
        escaparCSV(Math.round(parseFloat(coop.Total_x0020_votos))),
        escaparCSV(coop.RegistroCompleto ? "Completo" : "Pendiente"),
        escaparCSV(coop.FechaRegistro ? new Date(coop.FechaRegistro).toLocaleString("es-AR") : ""),
        escaparCSV(coop.PresidenteNombre),
        escaparCSV(coop.SecretarioNombre),
        escaparCSV(coop.Mailprincipal),
        escaparCSV(coop.Mailcopia),
        escaparCSV(coop.TotalTitulares || 0),
        escaparCSV(coop.TotalSuplentes || 0),
        escaparCSV(coop.TotalCartasPoder || 0),
        escaparCSV(extraerNombres(coop.TitularesJSON)),
        escaparCSV(extraerNombres(coop.SuplentesJSON)),
        escaparCSV(extraerCartasPoder(coop.CartasPoderJSON, coop.TitularesJSON))
      ].join(","));
    });

    // Crear archivo CSV y descargarlo
    const csvContent = csvRows.join("\n");
    const BOM = "\uFEFF"; // BOM para que Excel reconozca UTF-8
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fecha = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `metricas_asamblea_${fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("✅ CSV exportado exitosamente");
  };

  const metricasFiltradas = metricas.filter((coop) => {
    // Filtro por estado de registro
    if (filtro === "completas" && !coop.RegistroCompleto) return false;
    if (filtro === "incompletas" && coop.RegistroCompleto) return false;

    // Filtro por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        coop.Title?.toLowerCase().includes(searchLower) ||
        coop.field_1?.toLowerCase().includes(searchLower) ||
        coop.field_2?.toLowerCase().includes(searchLower) ||
        coop.Nombre_corto?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Calcular estadísticas
  const totalCooperativas = metricas.length;
  const cooperativasCompletas = metricas.filter((c) => c.RegistroCompleto).length;
  const cooperativasIncompletas = totalCooperativas - cooperativasCompletas;
  const porcentajeCompleto = totalCooperativas > 0 
    ? ((cooperativasCompletas / totalCooperativas) * 100).toFixed(1) 
    : 0;

  const totalVotos = metricas.reduce((sum, c) => sum + (parseFloat(c.Total_x0020_votos) || 0), 0);
  const totalTitulares = metricas.reduce((sum, c) => sum + (c.TotalTitulares || 0), 0);
  const totalSuplentes = metricas.reduce((sum, c) => sum + (c.TotalSuplentes || 0), 0);
  const totalCartasPoder = metricas.reduce((sum, c) => sum + (c.TotalCartasPoder || 0), 0);

  // Agrupar por Distrito Electoral (D.E)
  const cooperativasPorDE = metricas.reduce((acc, coop) => {
    const de = coop.field_7?.Value || "Sin D.E";
    if (!acc[de]) {
      acc[de] = { total: 0, completas: 0, votos: 0 };
    }
    acc[de].total++;
    if (coop.RegistroCompleto) acc[de].completas++;
    acc[de].votos += parseFloat(coop.Total_x0020_votos) || 0;
    return acc;
  }, {} as Record<string, { total: number; completas: number; votos: number }>);

  if (loading) {
    return (
      <div className="metrics">
        <div className="metrics-container">
          <HeaderForm titleForm="Métricas de Asamblea" showButtonBack={false} />
          <div className="metrics-loading">
            <div className="spinner"></div>
            <p>Cargando métricas...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics">
        <div className="metrics-container">
          <HeaderForm titleForm="Métricas de Asamblea" showButtonBack={false} />
          <div className="metrics-error">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button className="button" onClick={cargarMetricas}>
              Reintentar
            </button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="metrics">
      <div className="metrics-container">
        <HeaderForm titleForm="Métricas de Asamblea" showButtonBack={false} />

        {/* Resumen General */}
        <div className="metrics-summary">
          <div className="summary-header">
            <h2>📊 Resumen General</h2>
            <div className="action-buttons">
              <button 
                className="refresh-button" 
                onClick={cargarMetricas}
                disabled={loading}
                title="Actualizar datos"
              >
                {loading ? "🔄 Actualizando..." : "🔄 Actualizar"}
              </button>
              <button 
                className="export-button" 
                onClick={exportarCSV}
                disabled={loading || metricas.length === 0}
                title="Exportar a CSV"
              >
                📥 Exportar CSV
              </button>
            </div>
          </div>
          <div className="metrics-cards">
            <div className="metric-card">
              <div className="metric-value">{totalCooperativas}</div>
              <div className="metric-label">Total Cooperativas</div>
            </div>
            <div className="metric-card success">
              <div className="metric-value">{cooperativasCompletas}</div>
              <div className="metric-label">Registros Completos</div>
              <div className="metric-percentage">{porcentajeCompleto}%</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-value">{cooperativasIncompletas}</div>
              <div className="metric-label">Registros Incompletos</div>
            </div>
            <div className="metric-card info">
              <div className="metric-value">{Math.round(totalVotos)}</div>
              <div className="metric-label">Total Votos</div>
            </div>
          </div>

          <div className="metrics-cards">
            <div className="metric-card small">
              <div className="metric-value">{totalTitulares}</div>
              <div className="metric-label">Titulares</div>
            </div>
            <div className="metric-card small">
              <div className="metric-value">{totalSuplentes}</div>
              <div className="metric-label">Suplentes</div>
            </div>
            <div className="metric-card small">
              <div className="metric-value">{totalCartasPoder}</div>
              <div className="metric-label">Cartas de Poder</div>
            </div>
          </div>
        </div>

        {/* Métricas por Distrito Electoral */}
        <div className="metrics-region">
          <h2>🗺️ Métricas por Distrito Electoral</h2>
          <div className="region-table">
            <table>
              <thead>
                <tr>
                  <th>Distrito Electoral</th>
                  <th>Total</th>
                  <th>Completos</th>
                  <th>Incompletos</th>
                  <th>% Completo</th>
                  <th>Total Votos</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cooperativasPorDE)
                  .sort(([, a], [, b]) => (b as any).total - (a as any).total)
                  .map(([de, data]) => {
                    const stats = data as { total: number; completas: number; votos: number };
                    return (
                    <tr key={de}>
                      <td><strong>{de}</strong></td>
                      <td>{stats.total}</td>
                      <td className="text-success">{stats.completas}</td>
                      <td className="text-warning">{stats.total - stats.completas}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${((stats.completas / stats.total) * 100).toFixed(0)}%`,
                            }}
                          ></div>
                          <span className="progress-text">
                            {((stats.completas / stats.total) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>{Math.round(stats.votos)}</td>
                    </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="metrics-filters">
          <h2>🔍 Lista de Cooperativas</h2>
          <div className="filters-row">
            <div className="filter-group">
              <label>Estado de Registro:</label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value as any)}
                className="filter-select"
              >
                <option value="todas">📋 Todas</option>
                <option value="completas">✅ Completas</option>
                <option value="incompletas">⏳ Pendientes</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Buscar:</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Código, nombre, localidad..."
                className="filter-input"
              />
            </div>
            <div className="filter-results">
              Mostrando {metricasFiltradas.length} de {totalCooperativas}
            </div>
          </div>
        </div>

        {/* Tabla de Cooperativas */}
        <div className="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Localidad</th>
                <th>Nombre</th>
                <th>D.E</th>
                <th>Votos</th>
                <th>Estado</th>
                <th>Titulares</th>
                <th>Suplentes</th>
                <th>C. Poder</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {metricasFiltradas.map((coop) => (
                <tr key={coop.ID} className={coop.RegistroCompleto ? "complete" : "incomplete"}>
                  <td><strong>{coop.Title}</strong></td>
                  <td>{coop.field_1}</td>
                  <td className="coop-name">{coop.Nombre_corto || coop.field_2}</td>
                  <td>{coop.field_7?.Value || "-"}</td>
                  <td>{Math.round(parseFloat(coop.Total_x0020_votos))}</td>
                  <td>
                    <span className={`status-badge ${coop.RegistroCompleto ? "complete" : "incomplete"}`}>
                      {coop.RegistroCompleto ? "✓ Completo" : "⏳ Pendiente"}
                    </span>
                  </td>
                  <td>{coop.TotalTitulares || 0}</td>
                  <td>{coop.TotalSuplentes || 0}</td>
                  <td>{coop.TotalCartasPoder || 0}</td>
                  <td>
                    {coop.FechaRegistro
                      ? new Date(coop.FechaRegistro).toLocaleDateString("es-AR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer />
      </div>
    </div>
  );
}
