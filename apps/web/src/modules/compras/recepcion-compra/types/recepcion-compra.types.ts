export enum EstadoRecepcionCompra {
  Borrador = 1,
  Confirmada = 2,
  Anulada = 3,
}

export interface RecepcionCompraDetalleRequest {
  ordenCompraDetalleId: number;
  cantidadRecibida: number;
  loteId?: number | null;
  precioUnitario: number;
  observacion?: string | null;
}

export interface RecepcionCompraRequest {
  ordenCompraId: number;
  almacenId: number;
  fechaRecepcion: string;
  numeroFactura?: string | null;
  numeroRemision?: string | null;
  observacion?: string | null;
  detalles: RecepcionCompraDetalleRequest[];
}

export interface CreateRecepcionCompraRequest extends RecepcionCompraRequest {}

export interface UpdateRecepcionCompraRequest extends RecepcionCompraRequest {}

export interface AnularRecepcionCompraRequest {
  motivoAnulacion: string;
}

export interface RecepcionCompraDetalleResponse {
  id: number;
  ordenCompraDetalleId: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidadRecibida: number;
  precioUnitario: number;
  observacion?: string | null;
}

export interface RecepcionCompraResponse {
  id: number;
  numero: string;
  ordenCompraId: number;
  ordenCompraNumero?: string | null;
  proveedorId: number;
  proveedorRazonSocial?: string | null;
  almacenId: number;
  almacenNombre?: string | null;
  fechaRecepcion: string;
  estado: EstadoRecepcionCompra;
  numeroFactura?: string | null;
  numeroRemision?: string | null;
  recibidoPorId?: string | null;
  observacion?: string | null;
  movimientoInventarioId?: number | null;
  detalles: RecepcionCompraDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface RecepcionCompraQueryParams {
  ordenCompraId?: number | null;
  proveedorId?: number | null;
  almacenId?: number | null;
  estado?: EstadoRecepcionCompra | null;
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
