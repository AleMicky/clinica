import { z } from 'zod'

const catalogoItemFields = {
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'El código no puede superar los 50 caracteres.'),
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio.')
        .max(100, 'El nombre no puede superar los 100 caracteres.'),
    valor: z
        .string()
        .trim()
        .min(1, 'El valor es obligatorio.')
        .max(100, 'El valor no puede superar los 100 caracteres.'),
    orden: z
        .number({ error: 'El orden es obligatorio.' })
        .int('El orden debe ser un número entero.')
        .min(0, 'El orden no puede ser negativo.'),
}

export const createCatalogoItemSchema = z.object({
    catalogoGrupoId: z.string().trim().min(1, 'Seleccione un grupo.'),
    ...catalogoItemFields,
})

export const updateCatalogoItemSchema = createCatalogoItemSchema

export type CatalogoItemFormInput = z.infer<typeof createCatalogoItemSchema>
export type CatalogoItemFormValues = z.output<typeof createCatalogoItemSchema>

export const catalogoItemDefaultValues: CatalogoItemFormInput = {
    catalogoGrupoId: '',
    codigo: '',
    nombre: '',
    valor: '',
    orden: 1,
}
