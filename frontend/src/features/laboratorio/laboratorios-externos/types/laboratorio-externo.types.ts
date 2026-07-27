export type LaboratorioExterno = {
    id: string
    codigo: string
    nombre: string
    descripcion?: string | null
    contacto?: string | null
    telefono?: string | null
    email?: string | null
    activo: boolean
}

export type CreateLaboratorioExternoPayload = {
    codigo: string
    nombre: string
    descripcion?: string | null
    contacto?: string | null
    telefono?: string | null
    email?: string | null
    activo: boolean
}

export type UpdateLaboratorioExternoPayload = CreateLaboratorioExternoPayload
