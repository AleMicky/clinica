export interface CategoriaProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaPadreId?: number | null;
  categoriaPadreNombre?: string | null;
  cantidadSubcategorias: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateCategoriaProductoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaPadreId?: number | null;
}

export interface UpdateCategoriaProductoRequest extends CreateCategoriaProductoRequest {}

export interface CategoriaProductoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoriaPadreId?: number | null;
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
