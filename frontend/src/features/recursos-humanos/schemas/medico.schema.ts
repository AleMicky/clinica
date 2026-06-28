import { z } from 'zod'

export const medicoSchema = z.object({
    empleadoId: z.string().trim().min(1, 'Seleccione un empleado.'),
    especialidadId: z.string().trim().min(1, 'Seleccione una especialidad.'),
    matriculaProfesional: z
        .string()
        .trim()
        .min(1, 'La matrícula profesional es obligatoria.')
        .max(50, 'No puede superar los 50 caracteres.'),
    registroColegioMedico: z
        .string()
        .trim()
        .max(50, 'No puede superar los 50 caracteres.'),
})

export type MedicoFormInput = z.infer<typeof medicoSchema>
export type MedicoFormValues = z.output<typeof medicoSchema>

export const medicoDefaultValues: MedicoFormInput = {
    empleadoId: '',
    especialidadId: '',
    matriculaProfesional: '',
    registroColegioMedico: '',
}

function toOptionalText(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

export function toCreateMedicoPayload(
    values: MedicoFormValues,
): import('../types/medico.types').CreateMedicoPayload {
    return {
        empleadoId: values.empleadoId,
        especialidadId: values.especialidadId,
        matriculaProfesional: values.matriculaProfesional.trim(),
        registroColegioMedico: toOptionalText(values.registroColegioMedico),
    }
}

export function toUpdateMedicoPayload(
    values: MedicoFormValues,
): import('../types/medico.types').UpdateMedicoPayload {
    return toCreateMedicoPayload(values)
}
