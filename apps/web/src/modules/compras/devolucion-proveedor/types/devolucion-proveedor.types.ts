export enum EstadoDevolucionProveedor {
  Borrador = 1,
  PendienteAprobacion = 2,
  Aprobada = 3,
  Confirmada = 4,
  Rechazada = 5,
  Anulada = 6,
}

export interface DevolucionProveedorDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidad: number;
  motivo?: string | null;
  observacion?: string | null;
}

export interface DevolucionProveedorRequest {
  proveedorId: number;
  almacenId: number;
  recepcionCompraId?: number | null;
  fecha: string;
  motivo: string;
  observacion?: string | null;
  detalles: DevolucionProveedorDetalleRequest[];
}

export interface CreateDevolucionProveedorRequest
  extends DevolucionProveedorRequest {}

export interface UpdateDevolucionProveedorRequest
  extends DevolucionProveedorRequest {}

export interface AnularDevolucionProveedorRequest {
  motivoAnulacion: string;
}

export interface DevolucionProveedorDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidad: number;
  motivo?: string | null;
  observacion?: string | null;
}

export interface DevolucionProveedorResponse {
  id: number;
  numero: string;
  proveedorId: number;
  proveedorRazonSocial?: string | null;
  almacenId: number;
  almacenNombre?: string | null;
  recepcionCompraId?: number | null;
  recepcionCompraNumero?: string | null;
  fecha: string;
  estado: EstadoDevolucionProveedor;
  motivo: string;
  observacion?: string | null;
  autorizadoPorId?: string | null;
  fechaAutorizacion?: string | null;
  movimientoInventarioId?: number | null;
  detalles: DevolucionProveedorDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface DevolucionProveedorQueryParams {
  proveedorId?: number | null;
  almacenId?: number | null;
  recepcionCompraId?: number | null;
  estado?: EstadoDevolucionProveedor | null;
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
