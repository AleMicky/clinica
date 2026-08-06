// =============================
// API DTO Types (Backend .NET)
// =============================

export interface CargoResponse {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string;
    creadoPor?: string;
    modificadoPor?: string;
}

export interface CreateCargoRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
}

export type UpdateCargoRequest = CreateCargoRequest;

export interface CargoQueryParams {
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