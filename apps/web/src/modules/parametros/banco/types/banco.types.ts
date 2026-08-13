export interface BancoResponse {
  id: number;
  codigo: string;
  nombre: string;
  nombreCorto?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateBancoRequest {
  codigo: string;
  nombre: string;
  nombreCorto?: string | null;
}

export interface UpdateBancoRequest {
  codigo: string;
  nombre: string;
  nombreCorto?: string | null;
}

export interface BancoQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface MonedaInfo {
  id: number;
  codigo: string;
  nombre: string;
  simbolo?: string;
}

export interface CuentaBancariaResponse {
  id: number;
  bancoId: number;
  monedaId?: number;
  moneda?: MonedaInfo | null;
  numeroCuenta: string;
  nombreCuenta?: string | null;
  tipoCuenta?: string | null;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateCuentaBancariaRequest {
  monedaId: number;
  numeroCuenta: string;
  nombreCuenta?: string | null;
  tipoCuenta?: string | null;
}

export interface UpdateCuentaBancariaRequest {
  monedaId: number;
  numeroCuenta: string;
  nombreCuenta?: string | null;
  tipoCuenta?: string | null;
}

export interface CuentaBancariaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface BancoMetrics {
  totalBancos: number;
  bancosActivos: number;
  cuentasBancariasActivas: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
