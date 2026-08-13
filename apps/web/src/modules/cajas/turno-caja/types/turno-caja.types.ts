export enum EstadoTurnoCaja {
  Abierto = 1,
  Cerrado = 2,
}

export interface CajaInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface EmpleadoInfo {
  id: number;
  codigoEmpleado: string;
  nombreCompleto: string;
}

export interface TurnoCajaResponse {
  id: number;
  caja?: CajaInfo | null;
  empleado?: EmpleadoInfo | null;
  fechaHoraApertura: string;
  fechaHoraCierre?: string | null;
  estado: EstadoTurnoCaja;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateTurnoCajaRequest {
  cajaId: number;
  empleadoId: number;
  fechaHoraApertura: string;
  fechaHoraCierre?: string | null;
  estado: EstadoTurnoCaja;
}

export interface UpdateTurnoCajaRequest {
  cajaId: number;
  empleadoId: number;
  fechaHoraApertura: string;
  fechaHoraCierre?: string | null;
  estado: EstadoTurnoCaja;
}

export interface TurnoCajaQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface TurnoCajaMetrics {
  totalTurnos: number;
  turnosAbiertos: number;
  turnosCerrados: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
