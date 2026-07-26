export type CatalogoBase = {
    id: string
    codigo: string
    nombre: string
    descripcion: string | null
}

export type Area = CatalogoBase

export type Especialidad = CatalogoBase
export type Profesion = CatalogoBase
export type Cargo = CatalogoBase

export type CreateCatalogoBasePayload = {
    codigo: string
    nombre: string
    descripcion?: string | null
}

export type UpdateCatalogoBasePayload = {
    codigo: string
    nombre: string
    descripcion?: string | null
}

export type CreateCatalogoResult = { id: string }
