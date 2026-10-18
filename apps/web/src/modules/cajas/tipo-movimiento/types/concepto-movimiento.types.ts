export interface ConceptoMovimientoCajaInfo {
  id: number;
  tipoMovimientoCajaId: number;
  tipoMovimientoCaja?: {
    id: number;
    codigo: string;
    nombre: string;
    naturaleza: string;
  };
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

export interface CreateConceptoMovimientoCajaRequest {
  tipoMovimientoCajaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateConceptoMovimientoCajaRequest {
  tipoMovimientoCajaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}
