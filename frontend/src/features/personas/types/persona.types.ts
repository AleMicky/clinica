export type EntityId = string

export type Persona = {
    id: EntityId
    tipoDocumentoId: EntityId
    tipoDocumentoNombre: string
    numeroDocumento: string
    extensionDocumentoId?: EntityId | null
    extensionDocumentoNombre?: string | null
    complementoDocumento?: string | null
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    nombreCompleto: string
    fechaNacimiento: string
    sexoId: EntityId
    sexoNombre: string
    estadoCivilId: EntityId
    estadoCivilNombre: string
    telefono: string
    direccion: string
}

export type PersonaLookup = Pick<
    Persona,
    'id' | 'nombreCompleto' | 'numeroDocumento' | 'tipoDocumentoNombre'
>

export type PersonaPagedQuery = {
    page?: number
    pageSize?: number
    search?: string
    tipoDocumentoId?: string
}

export type CreatePersonaPayload = {
    tipoDocumentoId: EntityId
    numeroDocumento: string
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    fechaNacimiento: string
    sexoId: EntityId
    estadoCivilId: EntityId
    telefono: string
    direccion: string
    extensionDocumentoId?: EntityId | null
    complementoDocumento?: string | null
}

export type UpdatePersonaPayload = CreatePersonaPayload
