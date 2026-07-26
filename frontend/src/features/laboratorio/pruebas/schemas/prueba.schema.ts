import { z } from 'zod'

export const pruebaSchema = z
    .object({
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
        especialidadId: z.string().trim().min(1, 'Seleccione una especialidad.'),
        tipoExamenId: z.string().trim().min(1, 'Seleccione un tipo de examen.'),
        tipoMuestraId: z.string().trim().min(1, 'Seleccione un tipo de muestra.'),
        requiereAyuno: z.boolean(),
        horasAyuno: z.number().int().min(0).max(72),
        esDerivable: z.boolean(),
    })
    .superRefine((values, ctx) => {
        if (values.requiereAyuno && values.horasAyuno <= 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['horasAyuno'],
                message: 'Indique las horas de ayuno.',
            })
        }
    })

export type PruebaFormValues = z.output<typeof pruebaSchema>

export const pruebaDefaultValues: PruebaFormValues = {
    codigo: '',
    nombre: '',
    especialidadId: '',
    tipoExamenId: '',
    tipoMuestraId: '',
    requiereAyuno: false,
    horasAyuno: 0,
    esDerivable: false,
}
