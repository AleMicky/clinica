import type { PagedQuery } from '../../../../shared/types/pagination.types'

export const MUESTRA_ESTADO_LABELS: Record<string, string> = {
    TOMADA: 'Tomada',
}

export const MUESTRA_ESTADO_COLORS: Record<string, string> = {
    TOMADA: 'blue',
}

export type MuestraDetalle = {
    id: string
    solicitudDetalleId: string
    pruebaId: string
    pruebaNombre: string
    estado: string
}

export type Muestra = {
    id: string
    solicitudId: string
    codigo: string
    tipoMuestraId?: string | null
    fechaToma: string
    tomadoPorEmpleadoId?: string | null
    estado: string
    observaciones?: string | null
    detalles: MuestraDetalle[]
}

export type MuestraPagedQuery = PagedQuery & {
    solicitudId?: string
    estado?: string
    search?: string
}

export type TomarMuestraPayload = {
    tipoMuestraId?: string | null
    tomadoPorEmpleadoId: string
    observaciones?: string | null
    solicitudDetalleIds?: string[] | null
}
