import { z } from 'zod'

export const valorReferenciaSchema = z
    .object({
        sexo: z.string().trim().max(20).optional().or(z.literal('')),
        edadMin: z.number().min(0, 'La edad no puede ser negativa.').nullable().optional(),
        edadMax: z.number().min(0, 'La edad no puede ser negativa.').nullable().optional(),
        valorMin: z.number().nullable().optional(),
        valorMax: z.number().nullable().optional(),
        valorTexto: z.string().trim().max(200, 'Máximo 200 caracteres.').optional().or(z.literal('')),
        activo: z.boolean(),
    })
    .superRefine((values, ctx) => {
        if (
            values.edadMin != null &&
            values.edadMax != null &&
            values.edadMax < values.edadMin
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['edadMax'],
                message: 'La edad máxima debe ser mayor o igual a la edad mínima.',
            })
        }

        if (
            values.valorMin != null &&
            values.valorMax != null &&
            values.valorMax < values.valorMin
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['valorMax'],
                message: 'El valor máximo debe ser mayor o igual al valor mínimo.',
            })
        }

        const hasValor =
            values.valorMin != null ||
            values.valorMax != null ||
            Boolean(values.valorTexto?.trim())

        if (!hasValor) {
            ctx.addIssue({
                code: 'custom',
                path: ['valorMin'],
                message: 'Indique al menos un valor mínimo, máximo o de texto.',
            })
        }
    })

export type ValorReferenciaFormValues = z.output<typeof valorReferenciaSchema>

export const valorReferenciaDefaultValues: ValorReferenciaFormValues = {
    sexo: '',
    edadMin: null,
    edadMax: null,
    valorMin: null,
    valorMax: null,
    valorTexto: '',
    activo: true,
}
