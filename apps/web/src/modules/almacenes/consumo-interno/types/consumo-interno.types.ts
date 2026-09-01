export enum EstadoConsumoInterno {
  Borrador = 1,
  Confirmado = 2,
  Anulado = 3,
}

export interface ConsumoInternoDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidad: number;
}

export interface ConsumoInternoRequest {
  numero: string;
  almacenId: number;
  areaId: number;
  fecha: string;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  observacion?: string | null;
  detalles: ConsumoInternoDetalleRequest[];
}

export interface CreateConsumoInternoRequest extends ConsumoInternoRequest {}

export interface UpdateConsumoInternoRequest extends ConsumoInternoRequest {}

export interface AnularConsumoInternoRequest {
  motivoAnulacion: string;
}

export interface ConsumoInternoDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidad: number;
}

export interface ConsumoInternoResponse {
  id: number;
  numero: string;
  almacenId: number;
  almacenNombre?: string | null;
  areaId: number;
  areaNombre?: string | null;
  fecha: string;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  observacion?: string | null;
  estado: EstadoConsumoInterno;
  movimientoInventarioId?: number | null;
  detalles: ConsumoInternoDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface ConsumoInternoQueryParams {
  almacenId?: number | null;
  areaId?: number | null;
  estado?: EstadoConsumoInterno | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
