import { z } from 'zod'

import { personaSchema } from '../../personas/schemas/persona.schema'
import type { CreateUsuarioPersonaFormValues } from '../schemas/usuario-persona.schema'
import { collectFieldErrors } from './form-errors'

const accesoStepSchema = z.object({
    userName: z.string().trim().optional(),
    email: z.union([z.literal(''), z.string().trim().email('Ingrese un correo válido.')]),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    roles: z.array(z.string().trim()).min(1, 'Asigne al menos un rol.'),
})

export function validatePersonaStep(
    values: CreateUsuarioPersonaFormValues,
): { valid: boolean; fieldErrors: Record<string, string> } {
    const result = personaSchema.safeParse({
        tipoDocumentoId: values.tipoDocumentoId ?? '',
        numeroDocumento: values.numeroDocumento ?? '',
        extensionDocumentoId: values.extensionDocumentoId ?? '',
        complementoDocumento: values.complementoDocumento ?? '',
        nombres: values.nombres ?? '',
        apellidoPaterno: values.apellidoPaterno ?? '',
        apellidoMaterno: values.apellidoMaterno ?? '',
        fechaNacimiento: values.fechaNacimiento ?? '',
        sexoId: values.sexoId ?? '',
        estadoCivilId: values.estadoCivilId ?? '',
        telefono: values.telefono ?? '',
        direccion: values.direccion ?? '',
    })

    if (result.success) {
        return { valid: true, fieldErrors: {} }
    }

    return {
        valid: false,
        fieldErrors: collectFieldErrors(result.error.issues),
    }
}

export function validateAccesoStep(values: CreateUsuarioPersonaFormValues): {
    valid: boolean
    fieldErrors: Record<string, string>
} {
    const result = accesoStepSchema.safeParse({
        userName: values.userName,
        email: values.email,
        password: values.password,
        roles: values.roles,
    })

    const fieldErrors = result.success
        ? {}
        : collectFieldErrors(result.error.issues)

    const hasUserName =
        Boolean(values.userName?.trim()) || Boolean(values.numeroDocumento?.trim())

    if (!hasUserName && !fieldErrors.userName) {
        fieldErrors.userName = 'El nombre de usuario es obligatorio.'
    }

    return {
        valid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
    }
}
