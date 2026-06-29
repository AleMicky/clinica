import type { CreatePersonaPayload } from '../../personas/types/persona.types'

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

export type CreatePacientePayload = {
    modo: 'nueva' | 'existente'
    personaId?: EntityId
    persona?: CreatePersonaPayload
    numeroHistoriaClinica?: string
    grupoSanguineoId?: EntityId | null
    alergias?: string | null
    observaciones?: string | null
}

export type UpdatePacientePayload = {
    personaId: EntityId
    numeroHistoriaClinica: string
    grupoSanguineoId?: EntityId | null
    alergias?: string | null
    observaciones?: string | null
}
