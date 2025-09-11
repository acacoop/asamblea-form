const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT;
const CONSULTAR_ENDPOINT = import.meta.env.VITE_CONSULTAR_ENDPOINT;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const TIMEOUT = Number(import.meta.env.VITE_TIMEOUT ?? 30000);

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

import type { ConsultaDatosResponse } from "../types/types";

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
