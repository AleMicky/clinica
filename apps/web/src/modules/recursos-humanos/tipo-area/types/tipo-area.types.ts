// =============================
// API DTO Types (Backend .NET)
// =============================

export interface TipoAreaResponse {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string;
    creadoPor?: string;
    modificadoPor?: string;
}

export interface CreateTipoAreaRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    orden: number;
}

export type UpdateTipoAreaRequest = CreateTipoAreaRequest;

export interface TipoAreaQueryParams {
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