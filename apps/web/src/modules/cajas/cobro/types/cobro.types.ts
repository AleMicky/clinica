import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

export enum EstadoCobro {
  Registrado = 1,
  Anulado = 2,
  DevueltoParcial = 3,
  Devuelto = 4,
}

export interface CobroDetalleRequest {
  metodoPagoId: number;
  monedaId: number;
  cuentaBancariaId?: number | null;
  monto: number;
  tipoCambio?: number;
  referencia?: string | null;
  entidadFinanciera?: string | null;
  observacion?: string | null;
}

export interface MetodoPagoInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MonedaInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface CobroDetalleResponse {
  id: number;
  cobroId: number;
  metodoPagoId: number;
  metodoPago?: MetodoPagoInfo | null;
  monedaId: number;
  moneda?: MonedaInfo | null;
  cuentaBancariaId?: number | null;
  monto: number;
  tipoCambio: number;
  montoMonedaBase: number;
  referencia?: string | null;
  entidadFinanciera?: string | null;
  observacion?: string | null;
}

export interface VentaPagadorInfo {
  id: number;
  tipo: number;
  ventaId: number;
  ventaNumero: string;
  ventaTotal?: number;
  pacienteId?: number | null;
  pacienteNombreCompleto?: string | null;
  pacienteDocumento?: string | null;
  numeroHistoriaClinica?: string | null;
  convenioId?: number | null;
  convenioNombre?: string | null;
  monto: number;
  estado: number;
}

export interface CobroResponse {
  id: number;
  numero: string;
  turnoCajaId?: number;
  turnoCaja?: TurnoCajaInfo | null;
  ventaPagadorId?: number;
  ventaPagador?: VentaPagadorInfo | null;
  fechaHora: string;
  total: number;
  estado: EstadoCobro;
  observacion?: string | null;
  motivoAnulacion?: string | null;
  fechaHoraAnulacion?: string | null;
  detalles: CobroDetalleResponse[];
  activo: boolean;
  fechaCreacion?: string;
}

export interface CreateCobroRequest {
  turnoCajaId: number;
  ventaPagadorId: number;
  fechaHora: string;
  observacion?: string | null;
  detalles: CobroDetalleRequest[];
}

export const EstadoCobroLabels: Record<EstadoCobro, string> = {
  [EstadoCobro.Registrado]: "Registrado",
  [EstadoCobro.Anulado]: "Anulado",
  [EstadoCobro.DevueltoParcial]: "Devuelto Parcial",
  [EstadoCobro.Devuelto]: "Devuelto",
};

export interface UpdateCobroRequest {
  turnoCajaId: number;
  ventaPagadorId: number;
  fechaHora: string;
  observacion?: string | null;
  detalles: CobroDetalleRequest[];
}

export interface AnularCobroRequest {
  motivoAnulacion: string;
}

export interface CobroQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  turnoCajaId?: number;
  estado?: EstadoCobro;
}

export interface CobroMetrics {
  totalCobros: number;
  pendientesCobro: number;
  completados: number;
  anulados: number;
  totalMontoCobrado: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
