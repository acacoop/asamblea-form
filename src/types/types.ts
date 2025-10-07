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

// Tipos para Métricas
export type CooperativaMetrica = {
  "@odata.etag": string;
  ItemInternalId: string;
  ID: number;
  Title: string;
  CodVerificador: string;
  CUIT: string;
  field_1: string; // Localidad
  field_2: string; // Nombre completo
  "N_x002b_C": string;
  Nombre_corto: string;
  field_4: number;
  field_5?: {
    "@odata.type": string;
    Id: number;
    Value: string; // Región
  };
  "field_5#Id": number;
  field_6: number;
  field_7?: {
    "@odata.type": string;
    Id: number;
    Value: string;
  };
  "field_7#Id": number;
  field_8?: {
    "@odata.type": string;
    Id: number;
    Value: string; // Sucursal
  };
  "field_8#Id": number;
  VotosConsec: number;
  VotosAsoc: number;
  Total_x0020_votos: string;
  Mailprincipal: string;
  Mailcopia?: string;
  Invitacion: boolean;
  RegistroCompleto: boolean;
  FechaRegistro?: string;
  FechaUltimaActualizacion?: string;
  EstadoRegistro?: {
    "@odata.type": string;
    Id: number;
    Value: string;
  };
  "EstadoRegistro#Id"?: number;
  VotosEfectivos?: number;
  SecretarioNombre?: string;
  PresidenteNombre?: string;
  CorreoRegistro?: string;
  TitularesJSON?: string;
  SuplentesJSON?: string;
  CartasPoderJSON?: string;
  TotalTitulares?: number;
  TotalSuplentes?: number;
  TotalCartasPoder?: number;
  Documentacion?: string;
  Modified: string;
  Created: string;
  Author: any;
  "Author#Claims": string;
  Editor: any;
  "Editor#Claims": string;
  "{Identifier}": string;
  "{IsFolder}": boolean;
  "{Thumbnail}": any;
  "{Link}": string;
  "{Name}": string;
  "{FilenameWithExtension}": string;
  "{Path}": string;
  "{FullPath}": string;
  "{ContentType}": any;
  "{ContentType}#Id": string;
  "{HasAttachments}": boolean;
  "{VersionNumber}": string;
};

export type MetricasResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: {
    "@odata.nextLink"?: string;
    value: CooperativaMetrica[];
  };
};

// Nota: helper parseMaybeJsonArray eliminado (no estaba en uso). Recrear si hace falta.
