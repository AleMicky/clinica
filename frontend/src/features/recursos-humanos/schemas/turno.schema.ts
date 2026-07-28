import { z } from 'zod'

const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/

export const turnoSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio.')
        .max(200, 'Máximo 200 caracteres.'),
    horaInicio: z
        .string()
        .min(1, 'La hora de inicio es obligatoria.')
        .regex(TIME_REGEX, 'Formato inválido (HH:mm).'),
    horaFin: z
        .string()
        .min(1, 'La hora de fin es obligatoria.')
        .regex(TIME_REGEX, 'Formato inválido (HH:mm).'),
    cruceDia: z.boolean(),
    activo: z.boolean(),
    permiteMultiplesMedicosTurno: z.boolean(),
})

export type TurnoFormValues = z.output<typeof turnoSchema>

export const turnoDefaultValues: TurnoFormValues = {
    codigo: '',
    nombre: '',
    horaInicio: '08:00:00',
    horaFin: '16:00:00',
    cruceDia: false,
    activo: true,
    permiteMultiplesMedicosTurno: false,
}

export function toTurnoPayload(values: TurnoFormValues) {
    const normalize = (value: string) =>
        value.length === 5 ? `${value}:00` : value

    return {
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
        horaInicio: normalize(values.horaInicio),
        horaFin: normalize(values.horaFin),
        cruceDia: values.cruceDia,
        activo: values.activo,
        permiteMultiplesMedicosTurno: values.permiteMultiplesMedicosTurno,
    }
}
