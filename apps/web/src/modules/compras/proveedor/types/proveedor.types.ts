export interface ProveedorResponse {
  id: number;
  codigo: string;
  razonSocial: string;
  nombreComercial?: string | null;
  nit?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  contacto?: string | null;
  observacion?: string | null;
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

export interface CreateProveedorRequest {
  codigo: string;
  razonSocial: string;
  nombreComercial?: string | null;
  nit?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  contacto?: string | null;
  observacion?: string | null;
}

export type UpdateProveedorRequest = CreateProveedorRequest;

export interface ProveedorQueryParams {
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

export interface ExcelImportError {
  row: number;
  column?: string | null;
  value?: string | null;
  message: string;
}

export interface ExcelImportResult {
  total: number;
  importados: number;
  omitidos: number;
  errores: number;
  errors: ExcelImportError[];
}
