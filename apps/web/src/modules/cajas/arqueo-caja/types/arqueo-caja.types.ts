import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

export interface ArqueoCajaDetalleRequest {
  metodoPagoId: number;
  monedaId: number;
  montoEsperado: number;
  montoContado: number;
}

export interface ArqueoCajaDetalleResponse {
  id: number;
  arqueoCajaId: number;
  metodoPagoId: number;
  monedaId: number;
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

export interface CreateArqueoCajaRequest {
  turnoCajaId: number;
  fechaHora: string;
  observacion?: string | null;
  detalles: ArqueoCajaDetalleRequest[];
}

export interface UpdateArqueoCajaRequest {
  turnoCajaId: number;
  fechaHora: string;
  observacion?: string | null;
  detalles: ArqueoCajaDetalleRequest[];
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
