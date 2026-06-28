import { z } from 'zod'

export const roleSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre del rol es obligatorio.')
        .max(256, 'El nombre no puede superar los 256 caracteres.'),
    descripcion: z
        .string()
        .trim()
        .max(500, 'La descripción no puede superar los 500 caracteres.'),
})

export type RoleFormInput = z.infer<typeof roleSchema>
export type RoleFormValues = z.output<typeof roleSchema>

export const roleDefaultValues: RoleFormInput = {
    name: '',
    descripcion: '',
}
