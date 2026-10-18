export interface MarcaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

export interface CreateMarcaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export type UpdateMarcaRequest = CreateMarcaRequest;

export interface MarcaQueryParams {
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
