// =============================
// API DTO Types (Backend .NET)
// =============================

export interface EmpleadoInfo {
    id: number;
    codigoEmpleado: string;
    nombreCompleto: string;
}

export interface AreaInfo {
    id: number;
    codigo: string;
    nombre: string;
}

export interface CargoInfo {
    id: number;
    codigo: string;
    nombre: string;
}

export interface AsignacionEmpleadoResponse {
    id: number;
    empleado?: EmpleadoInfo | null;
    area?: AreaInfo | null;
    cargo?: CargoInfo | null;
    fechaInicio: string;
    fechaFin?: string | null;
    observacion?: string | null;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string | null;
    creadoPor?: string | null;
    modificadoPor?: string | null;
}

export interface CreateAsignacionEmpleadoRequest {
    empleadoId: number;
    areaId: number;
    cargoId: number;
    fechaInicio: string;
    fechaFin?: string | null;
    observacion?: string | null;
}

export type UpdateAsignacionEmpleadoRequest = CreateAsignacionEmpleadoRequest;

export interface AsignacionEmpleadoQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    empleadoId?: number;
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
}

export interface AsignacionEmpleadoMetrics {
    total: number;
    activas: number;
    finalizadas: number;
}
