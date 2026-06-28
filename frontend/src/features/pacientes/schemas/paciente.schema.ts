import { z } from 'zod'

const optionalText = z.string().trim()

export const pacienteSchema = z.object({
    personaId: z.string().trim().min(1, 'Seleccione una persona.'),
    numeroHistoriaClinica: z
        .string()
        .trim()
        .min(1, 'El número de historia clínica es obligatorio.')
        .max(50, 'No puede superar los 50 caracteres.'),
    grupoSanguineoId: z.string().trim().optional(),
    alergias: optionalText.max(500, 'Las alergias no pueden superar los 500 caracteres.'),
    observaciones: optionalText.max(1000, 'Las observaciones no pueden superar los 1000 caracteres.'),
})

export type PacienteFormInput = z.infer<typeof pacienteSchema>
export type PacienteFormValues = z.output<typeof pacienteSchema>

export const pacienteDefaultValues: PacienteFormInput = {
    personaId: '',
    numeroHistoriaClinica: '',
    grupoSanguineoId: '',
    alergias: '',
    observaciones: '',
}

function toOptionalPayloadText(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

export function toCreatePacientePayload(
    values: PacienteFormValues,
): import('../types/paciente.types').CreatePacientePayload {
    return {
        personaId: values.personaId,
        numeroHistoriaClinica: values.numeroHistoriaClinica.trim(),
        grupoSanguineoId: toOptionalPayloadText(values.grupoSanguineoId ?? ''),
        alergias: toOptionalPayloadText(values.alergias),
        observaciones: toOptionalPayloadText(values.observaciones),
    }
}

export function toUpdatePacientePayload(
    values: PacienteFormValues,
): import('../types/paciente.types').UpdatePacientePayload {
    return toCreatePacientePayload(values)
}
