import { z } from 'zod'

const rolField = z
    .string()
    .trim()
    .min(1, 'Seleccione un rol.')

export const createUserSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(1, 'El nombre de usuario es obligatorio.')
        .max(256, 'El nombre de usuario no puede superar los 256 caracteres.'),
    nombreCompleto: z
        .string()
        .trim()
        .min(1, 'El nombre completo es obligatorio.')
        .max(200, 'El nombre completo no puede superar los 200 caracteres.'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    rol: rolField,
})

export const updateUserSchema = z.object({
    nombreCompleto: z
        .string()
        .trim()
        .min(1, 'El nombre completo es obligatorio.')
        .max(200, 'El nombre completo no puede superar los 200 caracteres.'),
    activo: z.boolean(),
})

export type CreateUserFormInput = z.infer<typeof createUserSchema>
export type CreateUserFormValues = z.output<typeof createUserSchema>

export type UpdateUserFormInput = z.infer<typeof updateUserSchema>
export type UpdateUserFormValues = z.output<typeof updateUserSchema>

export const createUserDefaultValues: CreateUserFormInput = {
    userName: '',
    nombreCompleto: '',
    password: '',
    rol: '',
}

export const updateUserDefaultValues: UpdateUserFormInput = {
    nombreCompleto: '',
    activo: true,
}
