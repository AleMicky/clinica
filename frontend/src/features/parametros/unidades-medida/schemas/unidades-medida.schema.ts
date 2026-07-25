import { z } from 'zod'

export const unidadMedidaSchema = z.object({
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
    simbolo: z
        .string()
        .trim()
        .min(1, 'El símbolo es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
})

export type UnidadMedidaFormValues = z.output<typeof unidadMedidaSchema>

export const unidadMedidaDefaultValues: UnidadMedidaFormValues = {
    codigo: '',
    nombre: '',
    simbolo: '',
}
