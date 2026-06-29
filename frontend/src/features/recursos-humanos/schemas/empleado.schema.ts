import { z } from 'zod'

const empleadoMedicoFieldsSchema = z.object({
    especialidadIds: z.array(z.string().trim().min(1)),
    especialidadPrincipalId: z.string().trim(),
    matriculaProfesional: z.string().trim(),
    registroColegioMedico: z.string().trim(),
})

export const empleadoSchema = z
    .object({
        personaId: z.string().trim().min(1, 'Seleccione una persona.'),
        codigoEmpleado: z
            .string()
            .trim()
            .min(1, 'El código de empleado es obligatorio.')
            .max(30, 'No puede superar los 30 caracteres.'),
        areaId: z.string().trim().min(1, 'Seleccione un área.'),
        departamentoId: z.string().trim().min(1, 'Seleccione un departamento.'),
        servicioId: z.string().trim().min(1, 'Seleccione un servicio.'),
        profesionId: z.string().trim().min(1, 'Seleccione una profesión.'),
        cargoId: z.string().trim().min(1, 'Seleccione un cargo.'),
        fechaIngreso: z.string().trim().optional(),
        esMedico: z.boolean(),
        especialidadIds: z.array(z.string().trim().min(1)),
        especialidadPrincipalId: z.string().trim(),
        matriculaProfesional: z.string().trim(),
        registroColegioMedico: z.string().trim(),
    })
    .superRefine((values, ctx) => {
        if (!values.esMedico) return

        const medicoResult = empleadoMedicoFieldsSchema
            .extend({
                especialidadIds: z
                    .array(z.string().trim().min(1))
                    .min(1, 'Seleccione al menos una especialidad.'),
                especialidadPrincipalId: z
                    .string()
                    .trim()
                    .min(1, 'Seleccione la especialidad principal.'),
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
            .refine(
                (medicoValues) =>
                    medicoValues.especialidadIds.includes(
                        medicoValues.especialidadPrincipalId,
                    ),
                {
                    message:
                        'La especialidad principal debe estar entre las seleccionadas.',
                    path: ['especialidadPrincipalId'],
                },
            )
            .safeParse(values)

        if (!medicoResult.success) {
            medicoResult.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: issue.path,
                })
            })
        }
    })

export type EmpleadoFormInput = z.infer<typeof empleadoSchema>
export type EmpleadoFormValues = z.output<typeof empleadoSchema>

export const empleadoDefaultValues: EmpleadoFormInput = {
    personaId: '',
    codigoEmpleado: '',
    areaId: '',
    departamentoId: '',
    servicioId: '',
    profesionId: '',
    cargoId: '',
    fechaIngreso: '',
    esMedico: false,
    especialidadIds: [],
    especialidadPrincipalId: '',
    matriculaProfesional: '',
    registroColegioMedico: '',
}

function toOptionalDate(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function toOptionalText(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function toMedicoPayload(values: EmpleadoFormValues) {
    return {
        especialidadIds: values.especialidadIds,
        especialidadPrincipalId: values.especialidadPrincipalId,
        matriculaProfesional: values.matriculaProfesional.trim(),
        registroColegioMedico: toOptionalText(values.registroColegioMedico ?? ''),
    }
}

export function toCreateEmpleadoPayload(
    values: EmpleadoFormValues,
): import('../types/empleado.types').CreateEmpleadoPayload {
    return {
        personaId: values.personaId,
        codigoEmpleado: values.codigoEmpleado.trim(),
        areaId: values.areaId,
        departamentoId: values.departamentoId,
        servicioId: values.servicioId,
        profesionId: values.profesionId,
        cargoId: values.cargoId,
        fechaIngreso: toOptionalDate(values.fechaIngreso ?? ''),
        esMedico: values.esMedico,
        medico: values.esMedico ? toMedicoPayload(values) : null,
    }
}

export function toUpdateEmpleadoPayload(
    values: EmpleadoFormValues,
): import('../types/empleado.types').UpdateEmpleadoPayload {
    return toCreateEmpleadoPayload(values)
}
