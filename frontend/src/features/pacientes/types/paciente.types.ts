import type { CreatePersonaPayload } from '../../personas/types/persona.types'

export type EntityId = string

export type Paciente = {
    id: EntityId
    personaId: EntityId
    personaNombreCompleto: string
    numeroHistoriaClinica: string
    tipoDocumentoNombre: string
    numeroDocumento: string
    extensionDocumentoNombre?: string | null
    complementoDocumento?: string | null
    fechaNacimiento: string
    sexoNombre: string
    telefono: string
    direccion: string
}

export type CreatePacientePayload = {
    modo: 'nueva' | 'existente'
    personaId?: EntityId
    persona?: CreatePersonaPayload
    numeroHistoriaClinica?: string
}

export type UpdatePacientePayload = {
    personaId: EntityId
    numeroHistoriaClinica: string
}

export function formatPacienteDocumento(paciente: Paciente) {
    const parts = [
        paciente.tipoDocumentoNombre,
        paciente.numeroDocumento,
        paciente.extensionDocumentoNombre,
        paciente.complementoDocumento,
    ]
        .map((part) => part?.trim())
        .filter(Boolean)

    return parts.length > 0 ? parts.join(' ') : '—'
}

export function calcularEdadPaciente(fechaNacimiento?: string | null) {
    if (!fechaNacimiento) return '—'

    const raw = typeof fechaNacimiento === 'string' ? fechaNacimiento.trim() : String(fechaNacimiento)
    if (!raw) return '—'

    const birth = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`)
    if (Number.isNaN(birth.getTime())) return '—'

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1
    }

    if (age < 0 || age > 130) return '—'

    return `${age} años`
}
