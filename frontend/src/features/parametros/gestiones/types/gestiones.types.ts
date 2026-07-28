export type Gestion = {
    id: string
    gestion: number
    fechaInicio: string
    fechaFin: string
    literal: string
    activa: boolean
}

export type CreateGestionPayload = {
    gestion: number
    fechaInicio: string
    fechaFin: string
    literal: string
    activa: boolean
}

export type UpdateGestionPayload = CreateGestionPayload

export type Periodo = {
    id: string
    gestionId: string
    numero: number
    fechaInicio: string
    fechaFin: string
    literal: string
}

export type UpdatePeriodoPayload = {
    fechaInicio: string
    fechaFin: string
    literal: string
}

export type PeriodoPagedQuery = {
    page?: number
    pageSize?: number
    search?: string
    gestionId?: string
}
