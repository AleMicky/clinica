import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AperturaCajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  turnoCajaId?: number;
}

export interface CreateAperturaCajaRequest {
  turnoCajaId: number;
  fechaHora: string;
  montoInicial: number;
  observacion?: string | null;
}

export interface UpdateAperturaCajaRequest {
  turnoCajaId: number;
  fechaHora: string;
  montoInicial: number;
  observacion?: string | null;
}

export interface AperturaCajaResponse {
  id: number;
  turnoCaja?: TurnoCajaInfo | null;
  fechaHora: string;
  montoInicial: number;
  observacion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}
