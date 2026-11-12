export enum EstadoCotizacionCompra {
  Borrador = 1,
  Recibida = 2,
  Seleccionada = 3,
  Rechazada = 4,
  Vencida = 5,
  Cancelada = 6,
}

export function normalizeEstadoCotizacionCompra(
  estado?: EstadoCotizacionCompra | string | number | null
): EstadoCotizacionCompra {
  if (typeof estado === "number" && estado >= 1 && estado <= 6) {
    return estado as EstadoCotizacionCompra;
  }
  const key = String(estado ?? "")
    .trim()
    .toLowerCase();
  switch (key) {
    case "1":
    case "borrador":
      return EstadoCotizacionCompra.Borrador;
    case "2":
    case "recibida":
      return EstadoCotizacionCompra.Recibida;
    case "3":
    case "seleccionada":
      return EstadoCotizacionCompra.Seleccionada;
    case "4":
    case "rechazada":
      return EstadoCotizacionCompra.Rechazada;
    case "5":
    case "vencida":
      return EstadoCotizacionCompra.Vencida;
    case "6":
    case "cancelada":
      return EstadoCotizacionCompra.Cancelada;
    default:
      return EstadoCotizacionCompra.Borrador;
  }
}

export function getEstadoCotizacionCompraLabel(
  estado?: EstadoCotizacionCompra | string | number | null
): string {
  switch (normalizeEstadoCotizacionCompra(estado)) {
    case EstadoCotizacionCompra.Borrador:
      return "Borrador";
    case EstadoCotizacionCompra.Recibida:
      return "Recibida";
    case EstadoCotizacionCompra.Seleccionada:
      return "Seleccionada";
    case EstadoCotizacionCompra.Rechazada:
      return "Rechazada";
    case EstadoCotizacionCompra.Vencida:
      return "Vencida";
    case EstadoCotizacionCompra.Cancelada:
      return "Cancelada";
    default:
      return "-";
  }
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
