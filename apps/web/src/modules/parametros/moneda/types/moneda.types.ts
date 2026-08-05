export type EstadoMoneda = "Activo" | "Inactivo";

export interface Moneda {
  id: string;
  codigo: string;
  simbolo: string;
  nombre: string;
  decimales: number;
  esMonedaBase: boolean;
  estado: EstadoMoneda;
}

export interface MonedaMetrics {
  monedaBase: string;
  monedasHabilitadas: number;
  facturacionMultimoneda: boolean;
  monedasInactivas: number;
}

export interface MonedaFilters {
  search: string;
  estado?: EstadoMoneda | "Todos";
}

// =============================
// API DTO Types (Backend .NET)
// =============================

export interface MonedaResponse {
  id: number;
  codigo: string;
  nombre: string;
  simbolo: string;
  decimales: number;
  esBase: boolean;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateMonedaRequest {
  codigo: string;
  nombre: string;
  simbolo: string;
  decimales?: number;
  esBase?: boolean;
}

export interface UpdateMonedaRequest extends CreateMonedaRequest {}

export interface TipoCambioResponse {
  id: number;
  monedaOrigenId: number;
  monedaDestinoId: number;
  compra: number;
  venta: number;
  fecha: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateTipoCambioRequest {
  monedaOrigenId: number;
  monedaDestinoId: number;
  compra: number;
  venta: number;
  fecha: string;
}

export interface UpdateTipoCambioRequest extends CreateTipoCambioRequest {}

export interface MonedaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface TipoCambioQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
