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

export type UpdateUnidadMedidaRequest = CreateUnidadMedidaRequest;

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

// =============================
// Excel Import Types
// =============================

export interface ExcelImportError {
  row: number;
  column: string | null;
  value: string | null;
  message: string;
}

export interface ExcelImportResult {
  total: number;
  importados: number;
  omitidos: number;
  errores: number;
  errors: ExcelImportError[];
}
