export enum EstadoSolicitudCompra {
  Borrador = 1,
  PendienteAprobacion = 2,
  Aprobada = 3,
  Rechazada = 4,
  Atendida = 5,
  Cancelada = 6,
}

export function normalizeEstadoSolicitudCompra(
  estado?: EstadoSolicitudCompra | string | number | null
): EstadoSolicitudCompra {
  if (typeof estado === "number" && estado >= 1 && estado <= 6) {
    return estado as EstadoSolicitudCompra;
  }
  const key = String(estado ?? "")
    .trim()
    .toLowerCase();
  switch (key) {
    case "1":
    case "borrador":
      return EstadoSolicitudCompra.Borrador;
    case "2":
    case "pendienteaprobacion":
    case "pendiente_aprobacion":
      return EstadoSolicitudCompra.PendienteAprobacion;
    case "3":
    case "aprobada":
      return EstadoSolicitudCompra.Aprobada;
    case "4":
    case "rechazada":
      return EstadoSolicitudCompra.Rechazada;
    case "5":
    case "atendida":
      return EstadoSolicitudCompra.Atendida;
    case "6":
    case "cancelada":
      return EstadoSolicitudCompra.Cancelada;
    default:
      return EstadoSolicitudCompra.Borrador;
  }
}

export function getEstadoSolicitudCompraLabel(
  estado?: EstadoSolicitudCompra | string | number | null
): string {
  switch (normalizeEstadoSolicitudCompra(estado)) {
    case EstadoSolicitudCompra.Borrador:
      return "Borrador";
    case EstadoSolicitudCompra.PendienteAprobacion:
      return "Pendiente Aprobación";
    case EstadoSolicitudCompra.Aprobada:
      return "Aprobada";
    case EstadoSolicitudCompra.Rechazada:
      return "Rechazada";
    case EstadoSolicitudCompra.Atendida:
      return "Atendida";
    case EstadoSolicitudCompra.Cancelada:
      return "Cancelada";
    default:
      return "-";
  }
}

export interface SolicitudCompraDetalleRequest {
  productoId: number;
  cantidadSolicitada: number;
  observacion?: string | null;
}

export interface SolicitudCompraRequest {
  almacenId: number;
  fechaSolicitud: string;
  fechaRequerida?: string | null;
  observacion?: string | null;
  detalles: SolicitudCompraDetalleRequest[];
}

export interface CreateSolicitudCompraRequest extends SolicitudCompraRequest {}

export interface UpdateSolicitudCompraRequest extends SolicitudCompraRequest {}

export interface AprobarSolicitudCompraRequest {
  observacionAprobacion?: string | null;
}

export interface RechazarSolicitudCompraRequest {
  motivoRechazo: string;
}

export interface CancelarSolicitudCompraRequest {
  motivoCancelacion: string;
}

export interface SolicitudCompraDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  cantidadSolicitada: number;
  cantidadAprobada?: number | null;
  observacion?: string | null;
}

export interface SolicitudCompraResponse {
  id: number;
  numero: string;
  almacenId: number;
  almacenNombre?: string | null;
  fechaSolicitud: string;
  fechaRequerida?: string | null;
  estado: EstadoSolicitudCompra;
  observacion?: string | null;
  solicitadoPorId?: string | null;
  aprobadoPorId?: string | null;
  fechaAprobacion?: string | null;
  observacionAprobacion?: string | null;
  detalles: SolicitudCompraDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface SolicitudCompraQueryParams {
  almacenId?: number | null;
  estado?: EstadoSolicitudCompra | null;
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
