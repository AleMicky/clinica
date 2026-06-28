import { z } from 'zod'

export const empleadoSchema = z.object({
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
}

function toOptionalDate(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
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
    }
}

export function toUpdateEmpleadoPayload(
    values: EmpleadoFormValues,
): import('../types/empleado.types').UpdateEmpleadoPayload {
    return toCreateEmpleadoPayload(values)
}
