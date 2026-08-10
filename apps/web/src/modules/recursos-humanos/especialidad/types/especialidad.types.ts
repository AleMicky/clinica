export type EstadoEspecialidad = "Activo" | "Inactivo";

export interface Especialidad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface EspecialidadMetrics {
  totalEspecialidades: number;
  especialidadesActivas: number;
  especialidadesInactivas: number;
}

export interface EspecialidadFilters {
  search: string;
  estado?: EstadoEspecialidad | "Todos";
}

// =============================
// API DTO Types (Backend .NET)
// =============================

export interface EspecialidadResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateEspecialidadRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface UpdateEspecialidadRequest extends CreateEspecialidadRequest {}

export interface EspecialidadQueryParams {
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
