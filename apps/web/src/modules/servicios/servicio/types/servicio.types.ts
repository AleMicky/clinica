export interface ServicioResponse {
  id: number;
  categoriaServicioId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio?: number;
  Precio?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface ServicioTarifarioResponse {
  id: number;
  categoriaServicioId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  Precio?: number;
}

export interface CreateServicioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateServicioRequest extends CreateServicioRequest {}

export interface ServicioQueryParams {
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

export interface ServicioItem extends ServicioResponse {
  categoriaNombre?: string;
}

export interface ServicioMetrics {
  totalServicios: number;
  totalCategoriasCount: number;
  conDescripcionCount: number;
}
