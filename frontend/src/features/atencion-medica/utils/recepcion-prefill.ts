import type { Paciente } from '../../pacientes/types/paciente.types'
import type { Persona } from '../../personas/types/persona.types'

function calcularEdad(fechaNacimiento: string): number | undefined {
    const birth = new Date(fechaNacimiento)
    if (Number.isNaN(birth.getTime())) return undefined

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1
    }

    return age >= 0 ? age : undefined
}

function toDateInputValue(value?: string | null): string | undefined {
    if (!value) return undefined
    return value.slice(0, 10)
}

export function buildPacientePrefill(
    paciente: Paciente,
    persona?: Persona | null,
): Record<string, unknown> {
    const now = new Date()
    const fechaHoy = now.toISOString().slice(0, 10)
    const horaActual = now.toTimeString().slice(0, 5)
    const edad = persona?.fechaNacimiento
        ? calcularEdad(persona.fechaNacimiento)
        : undefined

    return {
        historia_clinica: paciente.numeroHistoriaClinica,
        nombres: persona?.nombres ?? paciente.personaNombreCompleto,
        apellido_paterno: persona?.apellidoPaterno ?? '',
        apellido_materno: persona?.apellidoMaterno ?? '',
        nombres_apellidos: persona?.nombreCompleto ?? paciente.personaNombreCompleto,
        documento: persona?.numeroDocumento ?? '',
        fecha_nacimiento: toDateInputValue(persona?.fechaNacimiento),
        edad,
        sexo: persona?.sexoNombre ?? undefined,
        estado_civil: persona?.estadoCivilNombre ?? undefined,
        direccion: persona?.direccion ?? '',
        telefono: persona?.telefono ?? '',
        fecha: fechaHoy,
        hora: horaActual,
        fecha_atencion: fechaHoy,
        hora_atencion: horaActual,
    }
}

export function toIsoDateTime(value: unknown, tipoDato: string): string | null {
    if (value === undefined || value === null || value === '') return null

    const raw = String(value).trim()
    if (!raw) return null

    if (tipoDato === 'time') {
        const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw)
        if (!match) return null

        const date = new Date()
        date.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0)

        return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }

    if (tipoDato === 'date') {
        const date = new Date(`${raw}T12:00:00`)
        return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }

    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function formatFieldDisplayValue(value: unknown, tipoDato: string): string {
    if (value === undefined || value === null || value === '') return '—'

    if (tipoDato === 'bool') {
        return value ? 'Sí' : 'No'
    }

    return String(value)
}
