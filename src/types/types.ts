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
