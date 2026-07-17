import { z } from 'zod'

const optionalText = z.string().trim()

export const personaSchema = z.object({
    tipoDocumentoId: z.string().trim().min(1, 'Seleccione el tipo de documento.'),
    numeroDocumento: z
        .string()
        .trim()
        .min(1, 'El número de documento es obligatorio.')
        .max(20, 'No puede superar los 20 caracteres.'),
    extensionDocumentoId: z.string().trim().optional(),
    complementoDocumento: optionalText.max(
        10,
        'El complemento no puede superar los 10 caracteres.',
    ),
    nombres: z
        .string()
        .trim()
        .min(1, 'Los nombres son obligatorios.')
        .max(100, 'No puede superar los 100 caracteres.'),
    apellidoPaterno: z
        .string()
        .trim()
        .min(1, 'El apellido paterno es obligatorio.')
        .max(100, 'No puede superar los 100 caracteres.'),
    apellidoMaterno: optionalText.max(
        100,
        'No puede superar los 100 caracteres.',
    ),
    fechaNacimiento: z.string().trim().min(1, 'La fecha de nacimiento es obligatoria.'),
    sexoId: z.string().trim().min(1, 'Seleccione el sexo.'),
    estadoCivilId: z.string().trim().min(1, 'Seleccione el estado civil.'),
    telefono: z
        .string()
        .trim()
        .min(1, 'El teléfono es obligatorio.')
        .max(20, 'No puede superar los 20 caracteres.'),
    direccion: optionalText.max(
        500,
        'No puede superar los 500 caracteres.',
    ),
})

export type PersonaFormInput = z.infer<typeof personaSchema>
export type PersonaFormValues = z.output<typeof personaSchema>

export const personaDefaultValues: PersonaFormInput = {
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
}

function toOptionalPayloadText(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

function toOptionalPayloadId(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

export function toCreatePersonaPayload(
    values: PersonaFormValues,
): import('../types/persona.types').CreatePersonaPayload {
    return {
        tipoDocumentoId: values.tipoDocumentoId,
        numeroDocumento: values.numeroDocumento.trim(),
        nombres: values.nombres.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno: values.apellidoMaterno.trim(),
        fechaNacimiento: values.fechaNacimiento,
        sexoId: values.sexoId,
        estadoCivilId: values.estadoCivilId,
        telefono: values.telefono.trim(),
        direccion: values.direccion.trim(),
        extensionDocumentoId: toOptionalPayloadId(values.extensionDocumentoId ?? ''),
        complementoDocumento: toOptionalPayloadText(values.complementoDocumento),
    }
}

export function toUpdatePersonaPayload(
    values: PersonaFormValues,
): import('../types/persona.types').UpdatePersonaPayload {
    return toCreatePersonaPayload(values)
}
