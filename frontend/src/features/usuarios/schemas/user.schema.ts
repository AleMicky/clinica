import { z } from 'zod'

export const updateUserSchema = z.object({
    nombreCompleto: z
        .string()
        .trim()
        .min(1, 'El nombre completo es obligatorio.')
        .max(200, 'El nombre completo no puede superar los 200 caracteres.'),
    activo: z.boolean(),
})

export type UpdateUserFormInput = z.infer<typeof updateUserSchema>
export type UpdateUserFormValues = z.output<typeof updateUserSchema>

export const updateUserDefaultValues: UpdateUserFormInput = {
    nombreCompleto: '',
    activo: true,
}
