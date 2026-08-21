export interface MetodoPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  requiereReferencia: boolean;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateMetodoPagoRequest {
  codigo: string;
  nombre: string;
  requiereReferencia: boolean;
}

export interface UpdateMetodoPagoRequest {
  codigo: string;
  nombre: string;
  requiereReferencia: boolean;
}

export interface MetodoPagoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface MetodoPagoMetrics {
  totalMetodos: number;
  activos: number;
  inactivos: number;
  requierenReferencia: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
