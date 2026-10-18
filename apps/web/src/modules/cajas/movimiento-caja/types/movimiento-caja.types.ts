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
}

export interface MovimientoCajaMetrics {
  totalMovimientos: number;
  totalIngresos: number;
  totalEgresos: number;
  balanceNeto: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
