export type NaturalezaTipoMovimiento = "ENTRADA" | "SALIDA";

export interface TipoMovimientoCajaInfo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: string;
  activo: boolean;
}

export interface CreateTipoMovimientoCajaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: string;
}

export interface UpdateTipoMovimientoCajaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: string;
}

// Re-export conceptos types for convenience and backwards-compatibility
export type {
  ConceptoMovimientoCajaInfo,
  CreateConceptoMovimientoCajaRequest,
  UpdateConceptoMovimientoCajaRequest,
} from "./concepto-movimiento.types";
