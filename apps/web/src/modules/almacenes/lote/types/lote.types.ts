export interface LoteResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  numeroLote: string;
  fechaFabricacion?: string | null;
  fechaVencimiento?: string | null;
  costoUnitario?: number | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateLoteRequest {
  productoId: number;
  numeroLote: string;
  fechaFabricacion?: string | null;
  fechaVencimiento?: string | null;
  costoUnitario?: number | null;
}

export interface UpdateLoteRequest extends CreateLoteRequest {}

export interface LoteQueryParams {
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
