import { z } from 'zod'

import type { CrearRecepcionAtencionPayload } from '../types/recepcion.types'

const optionalText = (max: number) =>
    z.string().max(max).optional().or(z.literal(''))

const requiredId = (message: string) =>
    z.string().trim().min(1, message)

const optionalId = z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))

export const recepcionFormSchema = z.object({
    pacienteId: requiredId('Seleccione un paciente'),
    tipoAtencionId: requiredId('Seleccione un tipo de atención'),
    servicioId: requiredId('Seleccione un servicio'),
    especialidadId: optionalId,
    medicoId: optionalId,
    motivoConsulta: z
        .string()
        .trim()
        .min(1, 'El motivo de consulta es requerido')
        .max(500),
    responsableFinancieroNombre: optionalText(200),
    responsableFinancieroDocumento: optionalText(50),
    responsableFinancieroTelefono: optionalText(30),
    seguroNombre: optionalText(200),
    numeroAfiliacion: optionalText(50),
    observaciones: optionalText(2000),
})

export type RecepcionFormValues = z.infer<typeof recepcionFormSchema>

export const recepcionDefaultValues: RecepcionFormValues = {
    pacienteId: '',
    tipoAtencionId: '',
    servicioId: '',
    especialidadId: '',
    medicoId: '',
    motivoConsulta: '',
    responsableFinancieroNombre: '',
    responsableFinancieroDocumento: '',
    responsableFinancieroTelefono: '',
    seguroNombre: '',
    numeroAfiliacion: '',
    observaciones: '',
}

function toOptionalId(value: string | undefined) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : null
}

function toOptionalText(value: string | undefined) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : null
}

export function toCrearRecepcionPayload(
    values: RecepcionFormValues,
): CrearRecepcionAtencionPayload {
    return {
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        servicioId: values.servicioId,
        motivoConsulta: values.motivoConsulta.trim(),
        especialidadId: toOptionalId(values.especialidadId),
        medicoId: toOptionalId(values.medicoId),
        responsableFinancieroNombre: toOptionalText(values.responsableFinancieroNombre),
        responsableFinancieroDocumento: toOptionalText(
            values.responsableFinancieroDocumento,
        ),
        responsableFinancieroTelefono: toOptionalText(values.responsableFinancieroTelefono),
        seguroNombre: toOptionalText(values.seguroNombre),
        numeroAfiliacion: toOptionalText(values.numeroAfiliacion),
        observaciones: toOptionalText(values.observaciones),
    }
}
