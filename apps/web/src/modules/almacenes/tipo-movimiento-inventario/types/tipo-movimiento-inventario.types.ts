export enum NaturalezaMovimiento {
  Entrada = 1,
  Salida = 2,
}

export interface TipoMovimientoInventarioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: NaturalezaMovimiento;
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface CreateTipoMovimientoInventarioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: NaturalezaMovimiento;
}

export interface UpdateTipoMovimientoInventarioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  naturaleza: NaturalezaMovimiento;
}

export interface TipoMovimientoInventarioQueryParams {
  naturaleza?: NaturalezaMovimiento;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
