import { z } from 'zod'

export const areaFormSchema = z.object({
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
    tipoAreaId: z
        .string()
        .min(1, 'Seleccione un tipo de área.')
        .uuid('Seleccione un tipo de área.'),
    areaPadreId: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
    responsableEmpleadoId: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
})

export type AreaFormValues = z.output<typeof areaFormSchema>

export const areaFormDefaultValues: AreaFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    tipoAreaId: '',
    areaPadreId: '',
    responsableEmpleadoId: '',
}
