const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT;
const CONSULTAR_ENDPOINT = import.meta.env.VITE_CONSULTAR_ENDPOINT;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const TIMEOUT = Number(import.meta.env.VITE_TIMEOUT ?? 30000);
const METRICAS_ENDPOINT = import.meta.env.VITE_METRICAS_ENDPOINT;

async function request<T>(
  url: string,
  body: any,
  signal?: AbortSignal
): Promise<T> {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const err = new Error(`Error HTTP ${resp.status}: ${resp.statusText}`);
    (err as any).status = resp.status;
    throw err;
  }

  const text = await resp.text();
  if (!text.trim()) {
    throw new Error("Respuesta vacía del servidor");
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

/**
 * Autentica una cooperativa con su código y verificador
 */
export async function authCooperativa(
  codigo_cooperativa: string,
  codigo_verificador: string
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const data = await request<any>(
      AUTH_ENDPOINT,
      { codigo_cooperativa, codigo_verificador },
      controller.signal
    );
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Envía los datos del formulario
 */
export async function guardarFormulario(payload: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const data = await request<any>(API_ENDPOINT, payload, controller.signal);
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

import type { ConsultaDatosResponse, MetricasResponse } from "../types/types";

export async function consultarDatos(codigo_cooperativa: string) {
  if (!CONSULTAR_ENDPOINT) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const data = await request<ConsultaDatosResponse>(
      CONSULTAR_ENDPOINT,
      { codigo_cooperativa },
      controller.signal
    );
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Obtiene las métricas de todas las cooperativas
 */
export async function obtenerMetricas(): Promise<MetricasResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    console.log("🔄 Obteniendo métricas desde el endpoint...");
    const resp = await fetch(METRICAS_ENDPOINT, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    console.log("📡 Respuesta recibida:", resp.status, resp.statusText);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("❌ Error en la respuesta:", errorText);
      throw new Error(`Error HTTP ${resp.status}: ${resp.statusText}`);
    }

    const data = await resp.json();
    console.log("✅ Datos recibidos correctamente");
    console.log("📊 Total de cooperativas:", data?.value?.length || 0);
    
    const response: MetricasResponse = {
      statusCode: 200,
      headers: {},
      body: {
        "@odata.nextLink": data["@odata.nextLink"],
        value: data.value || []
      }
    };
    
    return response;
  } catch (error) {
    console.error("❌ Error al obtener métricas:", error);
    if ((error as any).name === 'AbortError') {
      console.error("⏱️ Timeout: La petición tardó más de 60 segundos");
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
