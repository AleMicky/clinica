import { z } from 'zod'

export const anularPagoSchema = z.object({
    motivo: z
        .string()
        .trim()
        .min(1, 'El motivo es obligatorio.')
        .max(2000, 'Máximo 2000 caracteres.'),
})

export type AnularPagoFormValues = z.output<typeof anularPagoSchema>

export const anularPagoDefaultValues: AnularPagoFormValues = {
    motivo: '',
}
