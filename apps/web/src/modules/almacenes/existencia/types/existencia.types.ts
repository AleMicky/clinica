export interface ExistenciaResponse {
  id: number;
  almacenId: number;
  almacenNombre?: string | null;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  cantidad: number;
  cantidadReservada: number;
  cantidadDisponible: number;
  costoPromedio?: number;
  valorInventario?: number;
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface CreateExistenciaRequest {
  almacenId: number;
  productoId: number;
  cantidad: number;
  cantidadReservada: number;
  costoPromedio?: number;
}

export interface UpdateExistenciaRequest {
  almacenId: number;
  productoId: number;
  cantidad: number;
  cantidadReservada: number;
  costoPromedio?: number;
}

export interface ExistenciaQueryParams {
  almacenId?: number;
  productoId?: number;
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
