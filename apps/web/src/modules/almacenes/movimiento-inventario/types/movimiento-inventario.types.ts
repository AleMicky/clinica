export enum EstadoMovimientoInventario {
  Borrador = 1,
  Confirmado = 2,
  Anulado = 3,
}

export interface MovimientoInventarioDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidad: number;
  costoUnitario?: number | null;
}

export interface MovimientoInventarioRequest {
  numero?: string;
  tipoMovimientoInventarioId: number;
  almacenId: number;
  fechaMovimiento: string;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  observacion?: string | null;
  detalles: MovimientoInventarioDetalleRequest[];
}

export interface CreateMovimientoInventarioRequest
  extends MovimientoInventarioRequest {}

export interface UpdateMovimientoInventarioRequest
  extends MovimientoInventarioRequest {}

export interface AnularMovimientoInventarioRequest {
  motivoAnulacion: string;
}

export interface MovimientoInventarioDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidad: number;
  costoUnitario?: number | null;
  costoTotal: number;
}

export interface MovimientoInventarioResponse {
  id: number;
  numero: string;
  tipoMovimientoInventarioId: number;
  tipoMovimientoNombre?: string | null;
  almacenId: number;
  almacenNombre?: string | null;
  fechaMovimiento: string;
  estado: EstadoMovimientoInventario;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  observacion?: string | null;
  fechaConfirmacion?: string | null;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  detalles: MovimientoInventarioDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface MovimientoInventarioQueryParams {
  tipoMovimientoInventarioId?: number | null;
  almacenId?: number | null;
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
