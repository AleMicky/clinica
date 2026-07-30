import { z } from 'zod'

export const metodoPagoSchema = z.object({
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
    requiereReferencia: z.boolean(),
    esEfectivo: z.boolean(),
})

export type MetodoPagoFormValues = z.output<typeof metodoPagoSchema>

export const metodoPagoDefaultValues: MetodoPagoFormValues = {
    codigo: '',
    nombre: '',
    requiereReferencia: false,
    esEfectivo: false,
}
