export enum EstadoVenta {
  Pendiente = 1,
  ParcialmentePagada = 2,
  Pagada = 3,
  Anulada = 4,
}

export const EstadoVentaLabels: Record<EstadoVenta, string> = {
  [EstadoVenta.Pendiente]: "Pendiente",
  [EstadoVenta.ParcialmentePagada]: "Parcialmente Pagada",
  [EstadoVenta.Pagada]: "Pagada",
  [EstadoVenta.Anulada]: "Anulada",
};

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

export interface ServiceInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MedicoInfo {
  id: number;
  nombreMedico: string;
}

export interface VentaDetalleResponse extends AuditableResponse {
  id: number;
  ventaId: number;
  servicioId?: number;
  servicio?: ServiceInfo | null;
  medicoId?: number | null;
  medico?: MedicoInfo | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
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
}

export interface CreateVentaDetalleRequest extends VentaDetalleRequest { }
export interface UpdateVentaDetalleRequest extends VentaDetalleRequest { }

export interface VentaPagadorRequest {
  tipo: TipoPagador;
  convenioId?: number | null;
  monto: number;
}

export interface CreateVentaPagadorRequest extends VentaPagadorRequest { }
export interface UpdateVentaPagadorRequest extends VentaPagadorRequest { }

export interface VentaRequest {
  admisionId: number;
  pacienteId: number;
  monedaId: number;
  fecha: string;
  detalles: VentaDetalleRequest[];
  pagadores: VentaPagadorRequest[];
}

export interface CreateVentaRequest extends VentaRequest { }
export interface UpdateVentaRequest extends VentaRequest { }

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

// Helpers de formateo limpio
export function formatVentaServicioNombre(detalle: VentaDetalleResponse): string {
  if (detalle.servicio?.nombre) {
    return detalle.servicio.nombre;
  }
  return `Servicio #${detalle.servicioId || detalle.servicio?.id || detalle.id}`;
}

export function formatVentaMedicoNombre(detalle: VentaDetalleResponse): string {
  if (detalle.medico?.nombreMedico) {
    return detalle.medico.nombreMedico;
  }
  return detalle.medicoId ? `Médico #${detalle.medicoId}` : "Sin asignar";
}
