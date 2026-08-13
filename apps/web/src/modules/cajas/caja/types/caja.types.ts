export interface CajaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateCajaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCajaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface CajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CajaMetrics {
  totalCajas: number;
  cajasActivas: number;
  cajasInactivas: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
