import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

export interface MetodoPagoInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MonedaInfo {
  id: number;
  codigo: string;
  nombre: string;
  simbolo?: string;
}

export interface ArqueoCajaDetalleRequest {
  metodoPagoId: number;
  monedaId: number;
  montoContado: number;
}

export interface RegistrarArqueoCajaRequest {
  turnoCajaId: number;
  observacion?: string | null;
  detalles: ArqueoCajaDetalleRequest[];
}

export interface ArqueoCajaDetalleResponse {
  id: number;
  arqueoCajaId: number;
  metodoPagoId: number;
  metodoPago?: MetodoPagoInfo | null;
  monedaId: number;
  moneda?: MonedaInfo | null;
  montoEsperado: number;
  montoContado: number;
  diferencia: number;
}

export interface ArqueoCajaResponse {
  id: number;
  turnoCaja?: TurnoCajaInfo | null;
  fechaHora: string;
  totalEsperado: number;
  totalContado: number;
  diferencia: number;
  observacion?: string | null;
  detalles: ArqueoCajaDetalleResponse[];
  activo: boolean;
  fechaCreacion?: string;
}

export interface ArqueoCajaResumenDetalleResponse {
  metodoPagoId: number;
  metodoPagoNombre: string;
  monedaId: number;
  monedaNombre: string;
  monedaSimbolo: string;
  montoEsperado: number;
}

export interface ArqueoCajaResumenResponse {
  turnoCajaId: number;
  totalEsperado: number;
  detalles: ArqueoCajaResumenDetalleResponse[];
}

export interface ArqueoCajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  turnoCajaId?: number;
}

export interface ArqueoCajaMetrics {
  totalArqueos: number;
  totalConCuadreExacto: number;
  totalConDiferencia: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
