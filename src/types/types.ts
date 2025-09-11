// Shared TypeScript types

export type Cooperativa = {
  code: string;
  name?: string;
  votes?: number;
  substitutes?: number;
  CAR?: string | number;
  "CAR Nombre"?: string;
  [k: string]: any;
};

export type PersonaMin = { nombre?: string; documento?: string };

export type ConsultaDatosDatos = {
  timestamp?: string;
  autoridades?: {
    secretario?: string;
    presidente?: string;
  };
  contacto?: {
    correoElectronico?: string;
  };
  titulares?: PersonaMin[] | string;
  suplentes?: PersonaMin[] | string;
  cartasPoder?: any[] | string; // según tu UI
};

export type ConsultaDatosResponse =
  | { success: true; datos: ConsultaDatosDatos }
  | { success: false; message?: string };

// Utils para parsear campos que pueden venir como string JSON
export function parseMaybeJsonArray<T = any>(
  maybe: T[] | string | undefined
): T[] {
  if (!maybe) return [];
  if (Array.isArray(maybe)) return maybe;
  try {
    const arr = JSON.parse(maybe);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
