// =============================
// API DTO Types (Backend .NET)
// =============================

export interface PersonaRef {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string | null;
    tipoDocumento: string;
    numeroDocumento: string;
    extensionDocumento?: string | null;
}

export interface EmpleadoResponse {
    id: number;
    personaId: number;
    persona?: PersonaRef | null;
    codigoEmpleado: string;
    fechaIngreso: string;
    fechaRetiro?: string | null;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string | null;
    creadoPor?: string | null;
    modificadoPor?: string | null;
}

export interface CreateEmpleadoRequest {
    personaId: number;
    codigoEmpleado: string;
    fechaIngreso: string;
    fechaRetiro?: string | null;
}

export type UpdateEmpleadoRequest = CreateEmpleadoRequest;

export interface EmpleadoQueryParams {
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

export function nombreCompleto(
    p: PersonaRef | null | undefined,
): string {
    if (!p) return "—";
    const apellidos = [p.apellidoPaterno, p.apellidoMaterno]
        .filter(Boolean)
        .join(" ");
    return [apellidos, p.nombres].filter(Boolean).join(", ");
}

export function documentoCompleto(
    p: PersonaRef | null | undefined,
): string {
    if (!p) return "—";
    const ext = p.extensionDocumento
        ? ` ${p.extensionDocumento}`
        : "";
    return `${p.tipoDocumento} ${p.numeroDocumento}${ext}`.trim();
}