export type EntityId = string

export type Paciente = {
    id: EntityId
    personaId: EntityId
    personaNombreCompleto: string
    numeroHistoriaClinica: string
    grupoSanguineoId?: EntityId | null
    grupoSanguineoNombre?: string | null
    alergias?: string | null
    observaciones?: string | null
    fechaRegistro: string
}

export type PersonaLookup = {
    id: EntityId
    nombreCompleto: string
    numeroDocumento: string
    tipoDocumentoNombre: string
}

export type CreatePacientePayload = {
    personaId: EntityId
    numeroHistoriaClinica: string
    grupoSanguineoId?: EntityId | null
    alergias?: string | null
    observaciones?: string | null
}

export type UpdatePacientePayload = CreatePacientePayload
