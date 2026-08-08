export type EstadoUnidadMedida = "Activo" | "Inactivo";

export interface UnidadMedida {
  id: number;
  codigo: string;
  nombre: string;
  simbolo: string;
  categoria: string;
  activo: boolean;
}

export interface UnidadMedidaItem {
  id: number | string;
  codigo: string;
  nombre: string;
  simbolo: string;
  categoria: string;
  activo: boolean;
}

export interface UnidadMedidaMetrics {
  totalUnidades: number;
  dosificacionCount: number;
  volumenPesoCount: number;
  categoriasCount: number;
}

export interface UnidadMedidaFilters {
  search: string;
  categoria?: string;
  estado?: EstadoUnidadMedida | "Todos";
}

// =============================
// API DTO Types (Backend .NET)
// =============================

export interface UnidadMedidaResponse {
  id: number;
  categoria: string;
  codigo: string;
  nombre: string;
  simbolo: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateUnidadMedidaRequest {
  categoria: string;
  codigo: string;
  nombre: string;
  simbolo: string;
}

export interface UpdateUnidadMedidaRequest extends CreateUnidadMedidaRequest {}

export interface UnidadMedidaQueryParams {
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
