export enum EstadoOrdenCompra {
  Borrador = 1,
  PendienteAprobacion = 2,
  Aprobada = 3,
  EnviadaProveedor = 4,
  ParcialmenteRecibida = 5,
  Recibida = 6,
  Cancelada = 7,
}

export interface OrdenCompraDetalleRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  observacion?: string | null;
}

export interface OrdenCompraRequest {
  proveedorId: number;
  almacenId: number;
  solicitudCompraId?: number | null;
  cotizacionCompraId?: number | null;
  fecha: string;
  fechaEntregaEsperada?: string | null;
  condicionPago?: string | null;
  observacion?: string | null;
  detalles: OrdenCompraDetalleRequest[];
}

export interface CreateOrdenCompraRequest extends OrdenCompraRequest {}

export interface UpdateOrdenCompraRequest extends OrdenCompraRequest {}

export interface RecibirOrdenCompraDetalleRequest {
  detalleId: number;
  cantidadRecibida: number;
}

export interface RecibirOrdenCompraRequest {
  detalles: RecibirOrdenCompraDetalleRequest[];
}

export interface CancelarOrdenCompraRequest {
  motivoCancelacion: string;
}

export interface OrdenCompraDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  cantidad: number;
  cantidadRecibida: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  observacion?: string | null;
}

export interface OrdenCompraResponse {
  id: number;
  numero: string;
  proveedorId: number;
  proveedorRazonSocial?: string | null;
  almacenId: number;
  almacenNombre?: string | null;
  solicitudCompraId?: number | null;
  solicitudCompraNumero?: string | null;
  cotizacionCompraId?: number | null;
  cotizacionCompraNumero?: string | null;
  fecha: string;
  fechaEntregaEsperada?: string | null;
  estado: EstadoOrdenCompra;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  condicionPago?: string | null;
  observacion?: string | null;
  aprobadoPorId?: string | null;
  fechaAprobacion?: string | null;
  detalles: OrdenCompraDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface OrdenCompraQueryParams {
  proveedorId?: number | null;
  almacenId?: number | null;
  estado?: EstadoOrdenCompra | null;
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
