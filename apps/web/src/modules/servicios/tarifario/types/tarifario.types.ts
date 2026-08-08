export interface TarifarioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  monedaId: number;
  esPrincipal: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateTarifarioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  monedaId: number;
  esPrincipal: boolean;
}

export interface UpdateTarifarioRequest extends CreateTarifarioRequest {}

export interface TarifarioQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface TarifarioDetalleResponse {
  id: number;
  tarifarioId: number;
  servicioId: number;
  precio: number;
  servicioNombre?: string;
  servicioCodigo?: string;
}

export interface CreateTarifarioDetalleRequest {
  servicioId: number;
  precio: number;
}

export interface UpdateTarifarioDetalleRequest extends CreateTarifarioDetalleRequest {}

export interface TarifarioItem extends TarifarioResponse {
  monedaNombre?: string;
}

export interface TarifarioMetrics {
  totalTarifarios: number;
  principalesCount: number;
  vigentesCount: number;
}
