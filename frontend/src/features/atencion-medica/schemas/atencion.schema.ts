import { z } from 'zod'

import type {
    CreateAtencionPayload,
    UpdateAtencionPayload,
} from '../types/atencion-medica.types'

export const atencionFormSchema = z.object({
    pacienteId: z.string().trim().min(1, 'Seleccione un paciente'),
    tipoAtencionId: z.string().trim().min(1, 'Seleccione un tipo de atención'),
    formularioClinicoId: z
        .string()
        .trim()
        .min(1, 'Seleccione un formulario clínico'),
    fechaAtencion: z.string().trim().min(1, 'La fecha es requerida'),
    observaciones: z.string().max(2000).optional(),
})

export type AtencionFormValues = z.infer<typeof atencionFormSchema>

export const atencionDefaultValues: AtencionFormValues = {
    pacienteId: '',
    tipoAtencionId: '',
    formularioClinicoId: '',
    fechaAtencion: new Date().toISOString().slice(0, 16),
    observaciones: '',
}

export function toCreateAtencionPayload(values: AtencionFormValues): CreateAtencionPayload {
    return {
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        formularioClinicoId: values.formularioClinicoId,
        fechaAtencion: new Date(values.fechaAtencion).toISOString(),
        observaciones: values.observaciones?.trim() || null,
    }
}

export function toUpdateAtencionPayload(values: AtencionFormValues): UpdateAtencionPayload {
    return {
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        formularioClinicoId: values.formularioClinicoId,
        fechaAtencion: new Date(values.fechaAtencion).toISOString(),
        observaciones: values.observaciones?.trim() || null,
    }
}

export function atencionToFormValues(atencion: {
    pacienteId: string
    tipoAtencionId: string
    formularioClinicoId?: string | null
    fechaAtencion: string
    observaciones?: string | null
}): AtencionFormValues {
    return {
        pacienteId: atencion.pacienteId,
        tipoAtencionId: atencion.tipoAtencionId,
        formularioClinicoId: atencion.formularioClinicoId ?? '',
        fechaAtencion: atencion.fechaAtencion.slice(0, 16),
        observaciones: atencion.observaciones ?? '',
    }
}
