export enum NotificationType {
    Informacion = 1,
    Exito = 2,
    Advertencia = 3,
    Error = 4,
    // Aliases
    Information = 1,
    Success = 2,
    Warning = 3,
}

export interface Notification {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: NotificationType;
    modulo?: string | null;
    entidadTipo?: string | null;
    entidadId?: string | null;
    url?: string | null;
    leida: boolean;
    fechaLectura?: string | null;
    fechaCreacion: string;
}

export interface UnreadCountResponse {
    cantidad: number;
}