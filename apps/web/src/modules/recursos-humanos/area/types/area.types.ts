// =============================
// API DTO Types (Backend .NET)
// =============================

export interface AreaResponse {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    tipoAreaId: number;
    tipoAreaNombre?: string | null;
    areaPadreId?: number | null;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string;
    creadoPor?: string;
    modificadoPor?: string;
}

export interface AreaArbolResponse {
    id: number;
    codigo: string;
    nombre: string;
    tipoAreaId: number;
    tipoAreaNombre?: string | null;
    subareas: AreaArbolResponse[];
}

export interface CreateAreaRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    tipoAreaId: number;
    areaPadreId?: number | null;
}

export type UpdateAreaRequest = CreateAreaRequest;

export interface AreaQueryParams {
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