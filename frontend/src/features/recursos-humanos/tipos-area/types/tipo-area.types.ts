export type TipoArea = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    orden: number
}

export type CreateTipoAreaPayload = {
    codigo: string
    nombre: string
    descripcion?: string
    orden?: number
}

export type UpdateTipoAreaPayload = CreateTipoAreaPayload
