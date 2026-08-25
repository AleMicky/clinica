export interface OpcionMenuResponse {
  id: number;
  padreId?: number | null;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface OpcionMenuTreeResponse {
  id: number;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
  hijos: OpcionMenuTreeResponse[];
}

export interface CreateOpcionMenuRequest {
  padreId?: number | null;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
}

export interface UpdateOpcionMenuRequest {
  padreId?: number | null;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
}

export interface OpcionMenuQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
