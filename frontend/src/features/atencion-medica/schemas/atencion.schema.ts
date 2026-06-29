import { z } from 'zod'

import type {
    CreateAtencionPayload,
    UpdateAtencionPayload,
} from '../types/atencion-medica.types'

export const atencionFormSchema = z.object({
    numeroAtencion: z.string().trim().min(1, 'El número de atención es requerido').max(30),
    pacienteId: z.string().uuid('Seleccione un paciente'),
    tipoAtencionId: z.string().uuid('Seleccione un tipo de atención'),
    formularioClinicoId: z.string().uuid('Seleccione un formulario clínico'),
    fechaAtencion: z.string().min(1, 'La fecha es requerida'),
    estado: z.string().trim().min(1, 'El estado es requerido').max(30),
    observaciones: z.string().max(2000).optional().or(z.literal('')),
})

export type AtencionFormValues = z.infer<typeof atencionFormSchema>

export const atencionDefaultValues: AtencionFormValues = {
    numeroAtencion: '',
    pacienteId: '',
    tipoAtencionId: '',
    formularioClinicoId: '',
    fechaAtencion: new Date().toISOString().slice(0, 16),
    estado: 'BORRADOR',
    observaciones: '',
}

export function toCreateAtencionPayload(values: AtencionFormValues): CreateAtencionPayload {
    return {
        numeroAtencion: values.numeroAtencion.trim(),
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        formularioClinicoId: values.formularioClinicoId,
        fechaAtencion: new Date(values.fechaAtencion).toISOString(),
        estado: values.estado,
        observaciones: values.observaciones?.trim() || null,
    }
}

export function toUpdateAtencionPayload(values: AtencionFormValues): UpdateAtencionPayload {
    return {
        numeroAtencion: values.numeroAtencion.trim(),
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        formularioClinicoId: values.formularioClinicoId,
        fechaAtencion: new Date(values.fechaAtencion).toISOString(),
        estado: values.estado,
        observaciones: values.observaciones?.trim() || null,
    }
}

export function atencionToFormValues(atencion: {
    numeroAtencion: string
    pacienteId: string
    tipoAtencionId: string
    formularioClinicoId?: string | null
    fechaAtencion: string
    estado: string
    observaciones?: string | null
}): AtencionFormValues {
    return {
        numeroAtencion: atencion.numeroAtencion,
        pacienteId: atencion.pacienteId,
        tipoAtencionId: atencion.tipoAtencionId,
        formularioClinicoId: atencion.formularioClinicoId ?? '',
        fechaAtencion: atencion.fechaAtencion.slice(0, 16),
        estado: atencion.estado,
        observaciones: atencion.observaciones ?? '',
    }
}
