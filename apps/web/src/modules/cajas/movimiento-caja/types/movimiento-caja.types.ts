import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

export enum TipoMovimientoCaja {
  Ingreso = 1,
  Egreso = 2,
  Retiro = 3,
  Reposicion = 4,
  Devolucion = 5,
  AjustePositivo = 6,
  AjusteNegativo = 7,
}

export interface TipoMovimientoCajaInfo {
  id: number;
  codigo: string;
  nombre: string;
  naturaleza: string;
}

export interface ConceptoMovimientoCajaInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MonedaInfo {
  id: number;
  codigo: string;
  nombre: string;
  simbolo: string;
}

export interface MovimientoCajaResponse {
  id: number;
  turnoCaja?: TurnoCajaInfo | null;
  tipoMovimientoCajaId: number;
  tipoMovimientoCaja: TipoMovimientoCajaInfo;
  conceptoMovimientoCajaId: number;
  conceptoMovimientoCaja: ConceptoMovimientoCajaInfo;
  fechaHora: string;
  monedaId: number;
  moneda?: MonedaInfo | null;
  monto: number;
  tipoCambio: number;
  montoMonedaBase: number;
  naturalezaAplicada: string;
  referencia?: string | null;
  observacion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateMovimientoCajaRequest {
  turnoCajaId: number;
  tipoMovimientoCajaId: number;
  conceptoMovimientoCajaId: number;
  monedaId: number;
  monto: number;
  tipoCambio?: number;
  referencia?: string | null;
  observacion?: string | null;
}

export interface UpdateMovimientoCajaRequest {
  turnoCajaId: number;
  tipoMovimientoCajaId: number;
  conceptoMovimientoCajaId: number;
  monedaId: number;
  monto: number;
  tipoCambio?: number;
  referencia?: string | null;
  observacion?: string | null;
}

export interface MovimientoCajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  turnoCajaId?: number;
  tipoMovimientoCajaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface MovimientoCajaMetrics {
  totalMovimientos: number;
  totalIngresos: number;
  totalEgresos: number;
  balanceNeto: number;
}

export interface MovimientoCajaDiario {
  fecha: string;
  ingresos: number;
  egresos: number;
  balance: number;
  cantidad: number;
}

export interface MovimientoPorTipo {
  tipoNombre: string;
  naturaleza: string;
  monto: number;
  cantidad: number;
  porcentaje: number;
}

export interface MovimientoPorConcepto {
  conceptoNombre: string;
  tipoNombre: string;
  naturaleza: string;
  monto: number;
  cantidad: number;
  porcentaje: number;
}

export interface MovimientoPorCaja {
  cajaNombre: string;
  ingresos: number;
  egresos: number;
  balance: number;
  cantidad: number;
}

export interface MovimientoCajaMetricsResponse {
  totalMovimientos: number;
  totalIngresos: number;
  totalEgresos: number;
  balanceNeto: number;
  cantidadIngresos: number;
  cantidadEgresos: number;
  promedioIngreso: number;
  promedioEgreso: number;
  tendenciaDiaria: MovimientoCajaDiario[];
  porTipoMovimiento: MovimientoPorTipo[];
  porConcepto: MovimientoPorConcepto[];
  porCaja: MovimientoPorCaja[];
}

export interface ExportarMovimientosQueryParams {
  search?: string;
  turnoCajaId?: number;
  naturaleza?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

