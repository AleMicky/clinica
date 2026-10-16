export interface ExistenciaPartidaResponse {
  id: number;
  existenciaId: number;
  almacenId: number;
  almacenNombre?: string | null;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  partidaInventarioId: number;
  numeroPartida?: string | null;
  fechaVencimiento?: string | null;
  costoUnitario: number;
  cantidad: number;
  cantidadReservada: number;
  cantidadDisponible: number;
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface CreateExistenciaPartidaRequest {
  existenciaId: number;
  partidaInventarioId: number;
  cantidad: number;
  cantidadReservada: number;
}

export interface UpdateExistenciaPartidaRequest {
  existenciaId: number;
  partidaInventarioId: number;
  cantidad: number;
  cantidadReservada: number;
}

export interface ExistenciaPartidaQueryParams {
  existenciaId?: number;
  almacenId?: number;
  productoId?: number;
  partidaInventarioId?: number;
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
