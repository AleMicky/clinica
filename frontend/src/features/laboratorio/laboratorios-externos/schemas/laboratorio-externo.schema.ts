import { z } from 'zod'

export const laboratorioExternoSchema = z.object({
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
    descripcion: z
        .string()
        .trim()
        .max(500, 'Máximo 500 caracteres.')
        .optional()
        .or(z.literal('')),
    contacto: z
        .string()
        .trim()
        .max(200, 'Máximo 200 caracteres.')
        .optional()
        .or(z.literal('')),
    telefono: z
        .string()
        .trim()
        .max(50, 'Máximo 50 caracteres.')
        .optional()
        .or(z.literal('')),
    email: z
        .string()
        .trim()
        .email('Correo electrónico inválido.')
        .max(200, 'Máximo 200 caracteres.')
        .optional()
        .or(z.literal('')),
    activo: z.boolean(),
})

export type LaboratorioExternoFormValues = z.output<typeof laboratorioExternoSchema>

export const laboratorioExternoDefaultValues: LaboratorioExternoFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    contacto: '',
    telefono: '',
    email: '',
    activo: true,
}
