export type EspecialidadLab = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    orden: number
}

export type CreateEspecialidadLabPayload = {
    codigo: string
    nombre: string
    descripcion?: string
    orden?: number
}

export type UpdateEspecialidadLabPayload = CreateEspecialidadLabPayload
