import { z } from 'zod'

export const createCatalogoGrupoSchema = z.object({
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
    descripcion: z
        .string()
        .trim()
        .max(250, 'La descripción no puede superar los 250 caracteres.'),
})

export const updateCatalogoGrupoSchema = createCatalogoGrupoSchema.omit({
    codigo: true,
})

export type CreateCatalogoGrupoFormInput = z.infer<typeof createCatalogoGrupoSchema>
export type CreateCatalogoGrupoFormValues = z.output<typeof createCatalogoGrupoSchema>

export type UpdateCatalogoGrupoFormInput = z.infer<typeof updateCatalogoGrupoSchema>
export type UpdateCatalogoGrupoFormValues = z.output<typeof updateCatalogoGrupoSchema>

export const createCatalogoGrupoDefaultValues: CreateCatalogoGrupoFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
}

export const updateCatalogoGrupoDefaultValues: UpdateCatalogoGrupoFormInput = {
    nombre: '',
    descripcion: '',
}
