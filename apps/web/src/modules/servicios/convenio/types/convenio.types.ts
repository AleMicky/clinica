export interface ConvenioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateConvenioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface UpdateConvenioRequest extends CreateConvenioRequest {}

export interface ConvenioQueryParams {
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

export interface ConvenioTarifarioResponse {
  id: number;
  convenioId: number;
  tarifarioId?: number;
  tarifario?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
  fechaInicio: string;
  fechaFin?: string | null;
  tarifarioNombre?: string;
  tarifarioCodigo?: string;
}

export interface CreateConvenioTarifarioRequest {
  tarifarioId: number;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface UpdateConvenioTarifarioRequest extends CreateConvenioTarifarioRequest {}

export interface ConvenioItem extends ConvenioResponse {}

export interface ConvenioMetrics {
  totalConvenios: number;
  vigentesCount: number;
  conDescripcionCount: number;
}
