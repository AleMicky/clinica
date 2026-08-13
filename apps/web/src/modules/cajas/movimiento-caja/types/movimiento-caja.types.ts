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

export interface MovimientoCajaResponse {
  id: number;
  turnoCaja?: TurnoCajaInfo | null;
  tipo: TipoMovimientoCaja;
  fechaHora: string;
  monto: number;
  concepto: string;
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
  tipo: TipoMovimientoCaja;
  fechaHora: string;
  monto: number;
  concepto: string;
  referencia?: string | null;
  observacion?: string | null;
}

export interface UpdateMovimientoCajaRequest {
  turnoCajaId: number;
  tipo: TipoMovimientoCaja;
  fechaHora: string;
  monto: number;
  concepto: string;
  referencia?: string | null;
  observacion?: string | null;
}

export interface MovimientoCajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  turnoCajaId?: number;
  tipo?: TipoMovimientoCaja;
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
