import { z } from 'zod'

export const pruebaPrecioSchema = z
    .object({
        importeFacturado: z
            .number({ error: 'Ingrese un importe válido.' })
            .min(0, 'El importe no puede ser negativo.'),
        costoLaboratorio: z
            .number({ error: 'Ingrese un costo válido.' })
            .min(0, 'El costo no puede ser negativo.'),
        costoDerivacion: z
            .number({ error: 'Ingrese un costo válido.' })
            .min(0, 'El costo no puede ser negativo.'),
        fechaInicio: z.string().trim().min(1, 'Seleccione la fecha de inicio.'),
        fechaFin: z.string().trim().optional().or(z.literal('')),
        motivoCambio: z
            .string()
            .trim()
            .min(1, 'El motivo es obligatorio.')
            .max(300, 'Máximo 300 caracteres.'),
    })
    .superRefine((values, ctx) => {
        if (values.fechaFin && values.fechaFin < values.fechaInicio) {
            ctx.addIssue({
                code: 'custom',
                path: ['fechaFin'],
                message: 'La fecha fin debe ser mayor o igual a la fecha inicio.',
            })
        }
    })

export type PruebaPrecioFormValues = z.output<typeof pruebaPrecioSchema>

export const pruebaPrecioDefaultValues: PruebaPrecioFormValues = {
    importeFacturado: 0,
    costoLaboratorio: 0,
    costoDerivacion: 0,
    fechaInicio: '',
    fechaFin: '',
    motivoCambio: '',
}
