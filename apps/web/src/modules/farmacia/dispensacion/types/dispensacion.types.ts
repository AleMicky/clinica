export type TipoDispensacion =
  | "VentaAmbulatoria"
  | "Hospitalaria"
  | "Urgencia";

export type EstadoDispensacion =
  | "PendientePago"
  | "Pagado"
  | "Entregado"
  | "Anulado";

export interface DispensacionDetalleRequest {
  productoId: number;
  partidaInventarioId?: number | null;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  indicaciones?: string | null;
}

export interface CreateDispensacionRequest {
  tipo: TipoDispensacion;
  almacenId: number;
  pacienteId?: number | null;
  clienteNombre?: string | null;
  clienteDocumento?: string | null;
  medicoId?: number | null;
  admisionId?: number | null;
  observaciones?: string | null;
  detalles: DispensacionDetalleRequest[];
}

export interface RegistrarCobroDispensacionRequest {
  metodoPago: string;
  comprobanteCobro?: string | null;
  montoCobrado?: number | null;
}

export interface AnularDispensacionRequest {
  motivoAnulacion: string;
}

export interface DispensacionDetalleResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  partidaInventarioId?: number | null;
  lote?: string | null;
  fechaVencimiento?: string | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  indicaciones?: string | null;
}

export interface DispensacionResponse {
  id: number;
  numero: string;
  tipo: TipoDispensacion;
  estado: EstadoDispensacion;
  fecha: string;
  almacenId: number;
  almacenNombre: string;
  pacienteId?: number | null;
  pacienteNombre?: string | null;
  pacienteDocumento?: string | null;
  pacienteHistoriaClinica?: string | null;
  clienteNombre?: string | null;
  clienteDocumento?: string | null;
  medicoId?: number | null;
  medicoNombre?: string | null;
  admisionId?: number | null;
  admisionNumero?: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string | null;
  fechaCobro?: string | null;
  usuarioCobro?: string | null;
  metodoPago?: string | null;
  comprobanteCobro?: string | null;
  fechaEntrega?: string | null;
  usuarioEntrega?: string | null;
  movimientoInventarioId?: number | null;
  motivoAnulacion?: string | null;
  activo: boolean;
  fechaCreacion?: string | null;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
  detalles: DispensacionDetalleResponse[];
}

export interface DispensacionMetricsResponse {
  totalDispensaciones: number;
  totalPendientesPago: number;
  totalPagadas: number;
  totalEntregadas: number;
  montoTotalRecaudado: number;
  montoTotalPendiente: number;
}

export interface LoteMedicamentoStockResponse {
  partidaInventarioId: number;
  lote: string;
  fechaVencimiento?: string | null;
  cantidadDisponible: number;
}

export interface MedicamentoStockResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria?: string | null;
  unidadMedida?: string | null;
  stockDisponible: number;
  precioReferencial: number;
  lotes: LoteMedicamentoStockResponse[];
}

export interface DispensacionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoDispensacion;
  tipo?: TipoDispensacion;
  almacenId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
