export type Correlativo = {
    id: string
    codigo: string
    gestion: number
    ultimoNumero: number
    prefijo: string | null
    longitud: number
    numeroFormateado: string
    fechaCreacion: string
    fechaActualizacion: string | null
}

export type CorrelativoPagedQuery = {
    page: number
    pageSize: number
    codigo?: string
    gestion?: number
}

export type GenerarCorrelativoPayload = {
    codigo: string
    gestion?: number | null
    prefijo?: string | null
    longitud?: number | null
}
