import { z } from 'zod'

export const gestionSchema = z
    .object({
        gestion: z
            .number({ error: 'Ingrese la gestión.' })
            .int('Debe ser un número entero.')
            .min(2000, 'Mínimo 2000.')
            .max(2100, 'Máximo 2100.'),
        fechaInicio: z.string().trim().min(1, 'Seleccione la fecha de inicio.'),
        fechaFin: z.string().trim().min(1, 'Seleccione la fecha de fin.'),
        literal: z
            .string()
            .trim()
            .min(1, 'El literal es obligatorio.')
            .max(100, 'Máximo 100 caracteres.'),
        activa: z.boolean(),
    })
    .superRefine((values, ctx) => {
        if (values.fechaFin <= values.fechaInicio) {
            ctx.addIssue({
                code: 'custom',
                path: ['fechaFin'],
                message: 'La fecha fin debe ser posterior a la fecha inicio.',
            })
        }
    })

export type GestionFormValues = z.output<typeof gestionSchema>

export const gestionDefaultValues: GestionFormValues = {
    gestion: new Date().getFullYear(),
    fechaInicio: `${new Date().getFullYear()}-01-01`,
    fechaFin: `${new Date().getFullYear()}-12-31`,
    literal: `Gestión ${new Date().getFullYear()}`,
    activa: true,
}

export const periodoSchema = z
    .object({
        fechaInicio: z.string().trim().min(1, 'Seleccione la fecha de inicio.'),
        fechaFin: z.string().trim().min(1, 'Seleccione la fecha de fin.'),
        literal: z
            .string()
            .trim()
            .min(1, 'El literal es obligatorio.')
            .max(100, 'Máximo 100 caracteres.'),
    })
    .superRefine((values, ctx) => {
        if (values.fechaFin <= values.fechaInicio) {
            ctx.addIssue({
                code: 'custom',
                path: ['fechaFin'],
                message: 'La fecha fin debe ser posterior a la fecha inicio.',
            })
        }
    })

export type PeriodoFormValues = z.output<typeof periodoSchema>
