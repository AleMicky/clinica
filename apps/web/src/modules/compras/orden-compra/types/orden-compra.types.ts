export enum EstadoOrdenCompra {
  Borrador = 1,
  PendienteAprobacion = 2,
  Aprobada = 3,
  EnviadaProveedor = 4,
  ParcialmenteRecibida = 5,
  Recibida = 6,
  Cancelada = 7,
}

export function normalizeEstadoOrdenCompra(
  estado?: EstadoOrdenCompra | string | number | null
): EstadoOrdenCompra {
  if (typeof estado === "number" && estado >= 1 && estado <= 7) {
    return estado as EstadoOrdenCompra;
  }
  const key = String(estado ?? "")
    .trim()
    .toLowerCase();
  switch (key) {
    case "1":
    case "borrador":
      return EstadoOrdenCompra.Borrador;
    case "2":
    case "pendienteaprobacion":
    case "pendiente_aprobacion":
      return EstadoOrdenCompra.PendienteAprobacion;
    case "3":
    case "aprobada":
      return EstadoOrdenCompra.Aprobada;
    case "4":
    case "enviadaproveedor":
    case "enviada_proveedor":
      return EstadoOrdenCompra.EnviadaProveedor;
    case "5":
    case "parcialmenterecibida":
    case "parcialmente_recibida":
      return EstadoOrdenCompra.ParcialmenteRecibida;
    case "6":
    case "recibida":
      return EstadoOrdenCompra.Recibida;
    case "7":
    case "cancelada":
      return EstadoOrdenCompra.Cancelada;
    default:
      return EstadoOrdenCompra.Borrador;
  }
}

export function getEstadoOrdenCompraLabel(
  estado?: EstadoOrdenCompra | string | number | null
): string {
  switch (normalizeEstadoOrdenCompra(estado)) {
    case EstadoOrdenCompra.Borrador:
      return "Borrador";
    case EstadoOrdenCompra.PendienteAprobacion:
      return "Pendiente Aprobación";
    case EstadoOrdenCompra.Aprobada:
      return "Aprobada";
    case EstadoOrdenCompra.EnviadaProveedor:
      return "Enviada al Proveedor";
    case EstadoOrdenCompra.ParcialmenteRecibida:
      return "Parcialmente Recibida";
    case EstadoOrdenCompra.Recibida:
      return "Recibida";
    case EstadoOrdenCompra.Cancelada:
      return "Cancelada";
    default:
      return "-";
  }
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
