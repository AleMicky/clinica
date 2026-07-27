import { z } from 'zod'

import { ParametroTipoDato } from '../types/parametro.types'

export const parametroSchema = z.object({
    pruebaId: z.string().trim().min(1, 'Seleccione una prueba.'),
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
    unidadMedidaId: z.string().trim().optional().or(z.literal('')),
    tipoDato: z.enum([
        ParametroTipoDato.Numerico,
        ParametroTipoDato.Texto,
        ParametroTipoDato.Booleano,
    ]),
    orden: z.number().int().min(0, 'El orden no puede ser negativo.'),
    activo: z.boolean(),
})

export type ParametroFormValues = z.output<typeof parametroSchema>

export const parametroDefaultValues: ParametroFormValues = {
    pruebaId: '',
    codigo: '',
    nombre: '',
    unidadMedidaId: '',
    tipoDato: ParametroTipoDato.Numerico,
    orden: 0,
    activo: true,
}
