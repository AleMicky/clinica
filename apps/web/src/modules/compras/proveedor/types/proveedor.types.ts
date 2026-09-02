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

export interface UpdateProveedorRequest extends CreateProveedorRequest {}

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
