export enum EstadoCotizacionCompra {
  Borrador = 1,
  Recibida = 2,
  Seleccionada = 3,
  Rechazada = 4,
  Vencida = 5,
  Cancelada = 6,
}

export interface CotizacionCompraDetalleRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  observacion?: string | null;
}

export interface CotizacionCompraRequest {
  proveedorId: number;
  solicitudCompraId?: number | null;
  fecha: string;
  fechaVencimiento?: string | null;
  condicionPago?: string | null;
  tiempoEntrega?: string | null;
  observacion?: string | null;
  detalles: CotizacionCompraDetalleRequest[];
}

export interface CreateCotizacionCompraRequest extends CotizacionCompraRequest {}

export interface UpdateCotizacionCompraRequest extends CotizacionCompraRequest {}

export interface CancelarCotizacionCompraRequest {
  motivoCancelacion: string;
}

export interface CotizacionCompraDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  observacion?: string | null;
}

export interface CotizacionCompraResponse {
  id: number;
  numero: string;
  proveedorId: number;
  proveedorRazonSocial?: string | null;
  solicitudCompraId?: number | null;
  solicitudCompraNumero?: string | null;
  fecha: string;
  fechaVencimiento?: string | null;
  estado: EstadoCotizacionCompra;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  condicionPago?: string | null;
  tiempoEntrega?: string | null;
  observacion?: string | null;
  detalles: CotizacionCompraDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface CotizacionCompraQueryParams {
  proveedorId?: number | null;
  solicitudCompraId?: number | null;
  estado?: EstadoCotizacionCompra | null;
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
