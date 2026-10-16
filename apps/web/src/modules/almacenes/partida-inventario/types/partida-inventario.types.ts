export interface PartidaInventarioResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  numeroPartida?: string | null;
  fechaVencimiento?: string | null;
  costoUnitario: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreatePartidaInventarioRequest {
  productoId: number;
  numeroPartida?: string | null;
  fechaVencimiento?: string | null;
  costoUnitario: number;
}

export interface UpdatePartidaInventarioRequest extends CreatePartidaInventarioRequest {}

export interface PartidaInventarioQueryParams {
  productoId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
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
