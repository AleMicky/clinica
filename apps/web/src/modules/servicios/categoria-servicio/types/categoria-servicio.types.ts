export interface CategoriaServicioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  cantidadServicios?: number;
  totalServicios?: number;
  serviciosCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateCategoriaServicioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCategoriaServicioRequest extends CreateCategoriaServicioRequest {}

export interface CategoriaServicioQueryParams {
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

