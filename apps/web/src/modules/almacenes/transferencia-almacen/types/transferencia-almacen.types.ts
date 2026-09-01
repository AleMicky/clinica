export enum EstadoTransferenciaAlmacen {
  Borrador = 1,
  Solicitado = 2,
  Aprobado = 3,
  Despachado = 4,
  Recibido = 5,
  Cancelado = 6,
}

export interface TransferenciaAlmacenDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidadSolicitada: number;
}

export interface TransferenciaAlmacenRequest {
  numero: string;
  almacenOrigenId: number;
  almacenDestinoId: number;
  fechaSolicitud: string;
  observacion?: string | null;
  detalles: TransferenciaAlmacenDetalleRequest[];
}

export interface CreateTransferenciaAlmacenRequest
  extends TransferenciaAlmacenRequest {}

export interface UpdateTransferenciaAlmacenRequest
  extends TransferenciaAlmacenRequest {}

export interface TransferenciaDetalleCantidadRequest {
  detalleId: number;
  cantidad: number;
}

export interface AprobarTransferenciaAlmacenRequest {
  cantidades: TransferenciaDetalleCantidadRequest[];
}

export interface DespacharTransferenciaAlmacenRequest {
  cantidades: TransferenciaDetalleCantidadRequest[];
}

export interface RecibirTransferenciaAlmacenRequest {
  cantidades: TransferenciaDetalleCantidadRequest[];
}

export interface CancelarTransferenciaAlmacenRequest {
  motivoCancelacion: string;
}

export interface TransferenciaAlmacenDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidadSolicitada: number;
  cantidadAprobada: number;
  cantidadDespachada: number;
  cantidadRecibida: number;
}

export interface TransferenciaAlmacenResponse {
  id: number;
  numero: string;
  almacenOrigenId: number;
  almacenOrigenNombre?: string | null;
  almacenDestinoId: number;
  almacenDestinoNombre?: string | null;
  fechaSolicitud: string;
  fechaAprobacion?: string | null;
  fechaDespacho?: string | null;
  fechaRecepcion?: string | null;
  solicitadoPorId?: number | null;
  aprobadoPorId?: number | null;
  despachadoPorId?: number | null;
  recibidoPorId?: number | null;
  observacion?: string | null;
  motivoCancelacion?: string | null;
  estado: EstadoTransferenciaAlmacen;
  detalles: TransferenciaAlmacenDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface TransferenciaAlmacenQueryParams {
  almacenOrigenId?: number | null;
  almacenDestinoId?: number | null;
  estado?: EstadoTransferenciaAlmacen | null;
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
