import { z } from 'zod'

type CodigoNombreDescripcionSchemaOptions = {
    nombreMax?: number
    descripcionMax?: number
}

export function createCodigoNombreDescripcionSchema(
    options?: CodigoNombreDescripcionSchemaOptions,
) {
    const nombreMax = options?.nombreMax ?? 200
    const descripcionMax = options?.descripcionMax ?? 500

    return z.object({
        codigo: z
            .string()
            .trim()
            .min(1, 'El código es obligatorio.')
            .max(50, 'Máximo 50 caracteres.'),
        nombre: z
            .string()
            .trim()
            .min(1, 'El nombre es obligatorio.')
            .max(nombreMax, `Máximo ${nombreMax} caracteres.`),
        descripcion: z
            .string()
            .trim()
            .max(descripcionMax, `Máximo ${descripcionMax} caracteres.`)
            .optional()
            .or(z.literal('')),
    })
}

export const codigoNombreDescripcionSchema =
    createCodigoNombreDescripcionSchema()

export type CodigoNombreDescripcionFormValues = z.output<
    typeof codigoNombreDescripcionSchema
>

export const codigoNombreDescripcionDefaultValues: CodigoNombreDescripcionFormValues =
    {
        codigo: '',
        nombre: '',
        descripcion: '',
    }
