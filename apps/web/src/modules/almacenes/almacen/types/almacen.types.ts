export interface AlmacenResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateAlmacenRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  ubicacion?: string | null;
}

export interface UpdateAlmacenRequest extends CreateAlmacenRequest {}

export interface AlmacenQueryParams {
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
