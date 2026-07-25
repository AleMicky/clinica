import { z } from 'zod'

export const generarCorrelativoSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
    gestion: z
        .number({ error: 'Ingrese una gestión válida.' })
        .int('Debe ser un entero.')
        .min(2000, 'Gestión inválida.')
        .max(2100, 'Gestión inválida.')
        .optional()
        .nullable(),
    prefijo: z
        .string()
        .trim()
        .max(20, 'Máximo 20 caracteres.')
        .optional()
        .nullable(),
    longitud: z
        .number({ error: 'Ingrese una longitud válida.' })
        .int('Debe ser un entero.')
        .min(1, 'Mínimo 1.')
        .max(20, 'Máximo 20.')
        .optional()
        .nullable(),
})

export type GenerarCorrelativoFormValues = z.output<typeof generarCorrelativoSchema>

export const generarCorrelativoDefaultValues: GenerarCorrelativoFormValues = {
    codigo: '',
    gestion: new Date().getFullYear(),
    prefijo: '',
    longitud: 6,
}
