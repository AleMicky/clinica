export interface MetodoPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  requiereReferencia: boolean;
  activo: boolean;
}

export interface MetodoPagoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}
