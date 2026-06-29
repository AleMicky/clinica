import { z } from 'zod'

const newPasswordSchema = z
    .string()
    .min(1, 'La contraseña es obligatoria.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un dígito.')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula.')
    .regex(
        /[^a-zA-Z0-9]/,
        'La contraseña debe contener al menos un carácter especial.',
    )

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, 'La contraseña actual es obligatoria.'),
        newPassword: newPasswordSchema,
        confirmNewPassword: z
            .string()
            .min(1, 'Confirme la nueva contraseña.'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Las contraseñas no coinciden.',
        path: ['confirmNewPassword'],
    })

export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>
export type ChangePasswordFormValues = z.output<typeof changePasswordSchema>

export const changePasswordDefaultValues: ChangePasswordFormInput = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
}
