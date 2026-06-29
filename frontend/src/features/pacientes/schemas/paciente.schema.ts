import { z } from 'zod'

import { personaSchema, toCreatePersonaPayload } from '../../personas/schemas/persona.schema'

const optionalText = z.string().trim()

const pacienteClinicalFields = {
    grupoSanguineoId: z.string().trim().optional(),
    alergias: optionalText.max(500, 'Las alergias no pueden superar los 500 caracteres.'),
    observaciones: optionalText.max(1000, 'Las observaciones no pueden superar los 1000 caracteres.'),
}

export const pacienteUpdateSchema = z.object({
    personaId: z.string().trim().min(1, 'Seleccione una persona.'),
    numeroHistoriaClinica: z
        .string()
        .trim()
        .min(1, 'El número de historia clínica es obligatorio.')
        .max(30, 'No puede superar los 30 caracteres.'),
    ...pacienteClinicalFields,
})

export const pacienteCreateSchema = z
    .object({
        modo: z.enum(['nueva', 'existente']),
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
        ...pacienteClinicalFields,
    })
    .superRefine((data, ctx) => {
        if (data.modo === 'existente') {
            if (!data.personaId?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Seleccione una persona existente.',
                    path: ['personaId'],
                })
            }
            return
        }

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

export const pacienteSchema = pacienteCreateSchema

export type PacienteFormInput = z.infer<typeof pacienteCreateSchema>
export type PacienteFormValues = z.output<typeof pacienteCreateSchema>
export type PacienteUpdateFormValues = z.output<typeof pacienteUpdateSchema>

export const pacienteDefaultValues: PacienteFormInput = {
    modo: 'nueva',
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
    grupoSanguineoId: '',
    alergias: '',
    observaciones: '',
}

function toOptionalPayloadText(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
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

export function toCreatePacientePayload(
    values: PacienteFormValues,
): import('../types/paciente.types').CreatePacientePayload {
    const payload: import('../types/paciente.types').CreatePacientePayload = {
        modo: values.modo,
        grupoSanguineoId: toOptionalPayloadText(values.grupoSanguineoId ?? ''),
        alergias: toOptionalPayloadText(values.alergias),
        observaciones: toOptionalPayloadText(values.observaciones),
    }

    const numeroHistoria = values.numeroHistoriaClinica?.trim()
    if (numeroHistoria) {
        payload.numeroHistoriaClinica = numeroHistoria
    }

    if (values.modo === 'existente') {
        payload.personaId = values.personaId
        return payload
    }

    payload.persona = toCreatePersonaPayload({
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
    })

    return payload
}

export function toUpdatePacientePayload(
    values: PacienteUpdateFormValues,
): import('../types/paciente.types').UpdatePacientePayload {
    return {
        personaId: values.personaId,
        numeroHistoriaClinica: values.numeroHistoriaClinica.trim(),
        grupoSanguineoId: toOptionalPayloadText(values.grupoSanguineoId ?? ''),
        alergias: toOptionalPayloadText(values.alergias),
        observaciones: toOptionalPayloadText(values.observaciones),
    }
}
