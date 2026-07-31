import { z } from 'zod'

export const conceptoCajaSchema = z.object({
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
    tipoMovimiento: z.enum(['INGRESO', 'EGRESO'], {
        message: 'Seleccione el tipo de movimiento.',
    }),
    activo: z.boolean(),
})

export type ConceptoCajaFormValues = z.output<typeof conceptoCajaSchema>

export const conceptoCajaDefaultValues: ConceptoCajaFormValues = {
    codigo: '',
    nombre: '',
    tipoMovimiento: 'INGRESO',
    activo: true,
}
