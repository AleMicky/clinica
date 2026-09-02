export enum EstadoSolicitudCompra {
  Borrador = 1,
  PendienteAprobacion = 2,
  Aprobada = 3,
  Rechazada = 4,
  Atendida = 5,
  Cancelada = 6,
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
