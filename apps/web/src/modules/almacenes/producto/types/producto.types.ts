export interface ProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaProductoId: number;
  categoriaProductoNombre?: string | null;
  unidadMedidaId: number;
  unidadMedidaNombre?: string | null;
  unidadMedidaSimbolo?: string | null;
  controlaLote: boolean;
  controlaVencimiento: boolean;
  stockMinimo: number;
  stockMaximo?: number | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateProductoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaProductoId: number;
  unidadMedidaId: number;
  controlaLote: boolean;
  controlaVencimiento: boolean;
  stockMinimo: number;
  stockMaximo?: number | null;
}

export interface UpdateProductoRequest extends CreateProductoRequest {}

export interface ProductoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoriaProductoId?: number | null;
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

export interface ProductoMetrics {
  totalProductos: number;
  controlaLoteCount: number;
  controlaVencimientoCount: number;
  categoriasCount: number;
}
