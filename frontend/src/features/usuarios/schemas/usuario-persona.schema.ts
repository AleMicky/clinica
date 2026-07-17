import { z } from 'zod'

import { personaSchema, toCreatePersonaPayload } from '../../personas/schemas/persona.schema'
import type { CreateUsuarioPersonaApiPayload } from '../types/user.types'

const accessFields = {
    userName: z.string().trim().optional(),
    email: z.union([
        z.literal(''),
        z.email('Ingrese un correo válido.'),
    ]),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    roles: z.array(z.string().trim()).min(1, 'Asigne al menos un rol.'),
}

export const createUsuarioPersonaSchema = z
    .object({
        tipoDocumentoId: z.string().trim().optional(),
        numeroDocumento: z.string().trim().optional(),
        extensionDocumentoId: z.string().trim().optional(),
        complementoDocumento: z.string().trim().optional(),
        nombres: z.string().trim().optional(),
        apellidoPaterno: z.string().trim().optional(),
        apellidoMaterno: z.string().trim().optional(),
        fechaNacimiento: z.string().trim().optional(),
        sexoId: z.string().trim().optional(),
        estadoCivilId: z.string().trim().optional(),
        telefono: z.string().trim().optional(),
        direccion: z.string().trim().optional(),
        ...accessFields,
    })
    .superRefine((data, ctx) => {
        const personaResult = personaSchema.safeParse({
            tipoDocumentoId: data.tipoDocumentoId ?? '',
            numeroDocumento: data.numeroDocumento ?? '',
            extensionDocumentoId: data.extensionDocumentoId ?? '',
            complementoDocumento: data.complementoDocumento ?? '',
            nombres: data.nombres ?? '',
            apellidoPaterno: data.apellidoPaterno ?? '',
            apellidoMaterno: data.apellidoMaterno ?? '',
            fechaNacimiento: data.fechaNacimiento ?? '',
            sexoId: data.sexoId ?? '',
            estadoCivilId: data.estadoCivilId ?? '',
            telefono: data.telefono ?? '',
            direccion: data.direccion ?? '',
        })

        if (!personaResult.success) {
            for (const issue of personaResult.error.issues) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: issue.message,
                    path: issue.path,
                })
            }
        }
    })

export type CreateUsuarioPersonaFormInput = z.infer<typeof createUsuarioPersonaSchema>
export type CreateUsuarioPersonaFormValues = z.output<typeof createUsuarioPersonaSchema>

export const createUsuarioPersonaDefaultValues: CreateUsuarioPersonaFormInput = {
    tipoDocumentoId: '',
    numeroDocumento: '',
    extensionDocumentoId: '',
    complementoDocumento: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    sexoId: '',
    estadoCivilId: '',
    telefono: '',
    direccion: '',
    userName: '',
    email: '',
    password: '',
    roles: [],
}

export function buildNombreCompletoPreview(values: {
    nombres?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
}) {
    return [values.nombres, values.apellidoPaterno, values.apellidoMaterno]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ')
}

export function toCreateUsuarioPersonaPayload(
    values: CreateUsuarioPersonaFormValues,
): CreateUsuarioPersonaApiPayload {
    const email = values.email?.trim()

    return {
        modo: 'nueva',
        userName: values.userName?.trim() || values.numeroDocumento?.trim() || '',
        password: values.password,
        email: email || undefined,
        roles: values.roles,
        persona: toCreatePersonaPayload({
            tipoDocumentoId: values.tipoDocumentoId!,
            numeroDocumento: values.numeroDocumento!,
            extensionDocumentoId: values.extensionDocumentoId ?? '',
            complementoDocumento: values.complementoDocumento ?? '',
            nombres: values.nombres!,
            apellidoPaterno: values.apellidoPaterno!,
            apellidoMaterno: values.apellidoMaterno ?? '',
            fechaNacimiento: values.fechaNacimiento!,
            sexoId: values.sexoId!,
            estadoCivilId: values.estadoCivilId!,
            telefono: values.telefono!,
            direccion: values.direccion!,
        }),
    }
}
