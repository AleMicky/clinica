export type CatalogoBase = {
    id: string
    codigo: string
    nombre: string
    descripcion: string | null
}

export type Area = CatalogoBase

export type Departamento = CatalogoBase & {
    areaId: string
    areaNombre: string
}

export type Servicio = CatalogoBase & {
    departamentoId: string
    departamentoNombre: string
}

export type Prestacion = CatalogoBase & {
    servicioId: string
    servicioNombre: string
    precio: number
    requiereOrdenMedica: boolean
    requiereMedico: boolean
}

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

export type CreateDepartamentoPayload = CreateCatalogoBasePayload & {
    areaId: string
}

export type UpdateDepartamentoPayload = UpdateCatalogoBasePayload & {
    areaId: string
}

export type CreateServicioPayload = CreateCatalogoBasePayload & {
    departamentoId: string
}

export type UpdateServicioPayload = UpdateCatalogoBasePayload & {
    departamentoId: string
}

export type CreatePrestacionPayload = CreateCatalogoBasePayload & {
    servicioId: string
    precio: number
    requiereOrdenMedica: boolean
    requiereMedico: boolean
}

export type UpdatePrestacionPayload = UpdateCatalogoBasePayload & {
    servicioId: string
    precio: number
    requiereOrdenMedica: boolean
    requiereMedico: boolean
}

export type CreateCatalogoResult = { id: string }
