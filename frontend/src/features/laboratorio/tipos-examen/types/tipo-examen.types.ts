export type TipoExamen = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
}

export type CreateTipoExamenPayload = {
    codigo: string
    nombre: string
    descripcion?: string
}

export type UpdateTipoExamenPayload = CreateTipoExamenPayload
