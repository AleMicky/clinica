import { z } from 'zod'

import {
    personaSchema,
    toCreatePersonaPayload,
    toUpdatePersonaPayload,
} from '../../personas/schemas/persona.schema'

const optionalText = z.string().trim()

export const pacienteFormSchema = z
    .object({
        personaId: z.string().trim().optional(),
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
        numeroHistoriaClinica: optionalText.max(
            30,
            'No puede superar los 30 caracteres.',
        ),
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

export const pacienteCreateSchema = pacienteFormSchema
export const pacienteUpdateSchema = pacienteFormSchema
export const pacienteSchema = pacienteFormSchema

export type PacienteFormInput = z.infer<typeof pacienteFormSchema>
export type PacienteFormValues = z.output<typeof pacienteFormSchema>
export type PacienteUpdateFormValues = PacienteFormValues

export const pacienteDefaultValues: PacienteFormInput = {
    personaId: '',
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
    numeroHistoriaClinica: '',
}

function getFirstWord(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed.split(/\s+/)[0] ?? trimmed
}

function getInitial(value: string) {
    const word = value.trim()
    if (!word) return ''
    return word[0]?.toUpperCase() ?? ''
}

export function buildNumeroHistoriaClinicaPreview(values: {
    nombres?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
    numeroDocumento?: string
}) {
    const iniciales = [
        getInitial(getFirstWord(values.nombres ?? '')),
        getInitial(values.apellidoPaterno ?? ''),
        getInitial(values.apellidoMaterno ?? ''),
    ]
        .filter(Boolean)
        .join('')

    const documento = values.numeroDocumento?.trim() ?? ''

    if (!iniciales && !documento) return ''
    return `${iniciales}${documento}`
}

function toPersonaFormValues(values: PacienteFormValues) {
    return {
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
    }
}

export function toCreatePacientePayload(
    values: PacienteFormValues,
): import('../types/paciente.types').CreatePacientePayload {
    const payload: import('../types/paciente.types').CreatePacientePayload = {
        modo: 'nueva',
        persona: toCreatePersonaPayload(toPersonaFormValues(values)),
    }

    const numeroHistoria = values.numeroHistoriaClinica?.trim()
    if (numeroHistoria) {
        payload.numeroHistoriaClinica = numeroHistoria
    }

    return payload
}

export function toUpdatePacientePayload(
    values: PacienteFormValues,
    personaId: string,
    numeroHistoriaClinica: string,
): import('../types/paciente.types').UpdatePacientePayload {
    return {
        personaId,
        numeroHistoriaClinica,
        persona: toUpdatePersonaPayload(toPersonaFormValues(values)),
    }
}
