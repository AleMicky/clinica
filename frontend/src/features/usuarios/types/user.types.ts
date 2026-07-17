export type User = {
    id: string
    userName: string
    nombreCompleto: string
    email?: string | null
    activo: boolean
    roles: string[]
    personaId?: string | null
    personaNombreCompleto?: string | null
    personaNumeroDocumento?: string | null
    personaTipoDocumentoNombre?: string | null
    personaTelefono?: string | null
    personaExtensionDocumentoNombre?: string | null
    personaComplementoDocumento?: string | null
    createdAt?: string | null
}

export type UpdateUserPayload = {
    nombreCompleto: string
    activo: boolean
    email?: string | null
}

export type UpdateUserApiPayload = {
    nombreCompleto: string
    activo: boolean
    email?: string | null
}

export type CreateUsuarioPersonaApiPayload = {
    modo: 'nueva' | 'existente'
    personaId?: string
    persona?: import('../../personas/types/persona.types').CreatePersonaPayload
    userName: string
    password: string
    email?: string
    roles: string[]
}

export type UsuarioPersona = User & {
    personaId: string
    personaNombreCompleto: string
}
