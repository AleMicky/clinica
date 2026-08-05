export interface CatalogoGrupoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  elementosCount?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateCatalogoGrupoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface UpdateCatalogoGrupoRequest extends CreateCatalogoGrupoRequest {}

export interface CatalogoItemResponse {
  id: number;
  catalogoGrupoId: number;
  valor: string;
  nombre: string;
  orden: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateCatalogoItemRequest {
  valor: string;
  nombre: string;
  orden: number;
}

export interface UpdateCatalogoItemRequest extends CreateCatalogoItemRequest {}

export interface CatalogoMetrics {
  totalCatalogos: number;
  elementosRegistrados: number;
  catalogosActivos: number;
  catalogosInactivos: number;
}

export interface CatalogoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
