import { z } from 'zod'

export const catalogoBaseSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio.')
        .max(150, 'Máximo 150 caracteres.'),
    descripcion: z
        .string()
        .trim()
        .max(300, 'Máximo 300 caracteres.')
        .optional()
        .nullable(),
})

export const updateCatalogoBaseSchema = catalogoBaseSchema

export type CatalogoBaseFormInput = z.infer<typeof catalogoBaseSchema>
export type CatalogoBaseFormValues = z.output<typeof catalogoBaseSchema>

export const catalogoBaseDefaultValues: CatalogoBaseFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
}
