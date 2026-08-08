export interface CategoriaServicioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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

export interface CategoriaServicioMetrics {
  totalCategorias: number;
  conServiciosCount: number;
  conDescripcionCount: number;
}
