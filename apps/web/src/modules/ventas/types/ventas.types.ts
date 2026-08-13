export enum EstadoVenta {
  Pendiente = 1,
  ParcialmentePagada = 2,
  Pagada = 3,
  Anulada = 4,
}

export enum TipoPagador {
  Paciente = 1,
  Convenio = 2,
}

export enum EstadoVentaPagador {
  Pendiente = 1,
  ParcialmentePagado = 2,
  Pagado = 3,
  Anulado = 4,
}

export interface AuditableResponse {
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface VentaDetalleResponse extends AuditableResponse {
  id: number;
  ventaId: number;
  servicioId: number;
  medicoId?: number | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  porcentajeMedico?: number | null;
  montoMedico?: number | null;
  montoClinica?: number | null;
}

export interface VentaPagadorResponse extends AuditableResponse {
  id: number;
  ventaId: number;
  tipo: TipoPagador;
  convenioId?: number | null;
  monto: number;
  estado: EstadoVentaPagador;
}

export interface VentaResponse extends AuditableResponse {
  id: number;
  numero: string;
  admisionId: number;
  pacienteId: number;
  monedaId: number;
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: EstadoVenta;
  detalles: VentaDetalleResponse[];
  pagadores: VentaPagadorResponse[];
}

export interface VentaDetalleRequest {
  servicioId: number;
  medicoId?: number | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  porcentajeMedico?: number | null;
}

export interface CreateVentaDetalleRequest extends VentaDetalleRequest {}
export interface UpdateVentaDetalleRequest extends VentaDetalleRequest {}

export interface VentaPagadorRequest {
  tipo: TipoPagador;
  convenioId?: number | null;
  monto: number;
}

export interface CreateVentaPagadorRequest extends VentaPagadorRequest {}
export interface UpdateVentaPagadorRequest extends VentaPagadorRequest {}

export interface VentaRequest {
  admisionId: number;
  pacienteId: number;
  monedaId: number;
  fecha: string;
  detalles: VentaDetalleRequest[];
  pagadores: VentaPagadorRequest[];
}

export interface CreateVentaRequest extends VentaRequest {}
export interface UpdateVentaRequest extends VentaRequest {}

export interface CambiarEstadoVentaRequest {
  estadoDestino: EstadoVenta;
  motivo?: string;
}

export interface VentaQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoVenta;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface VentaMetrics {
  totalVentas: number;
  pendientes: number;
  pagadas: number;
  anuladas: number;
  montoTotal: number;
}
