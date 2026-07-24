import { z } from 'zod'

import type {
    RecepcionPacienteNuevoPayload,
    RecepcionarAtencionPayload,
    UpdateAtencionPayload,
} from '../types/atencion-medica.types'

const pacienteNuevoSchema = z.object({
    tipoDocumentoId: z.string().trim().min(1, 'Seleccione el tipo de documento'),
    numeroDocumento: z.string().trim().min(1, 'Ingrese el número de documento'),
    nombres: z.string().trim().min(1, 'Ingrese los nombres'),
    apellidoPaterno: z.string().trim().min(1, 'Ingrese el apellido paterno'),
    apellidoMaterno: z.string().trim().optional().default(''),
    fechaNacimiento: z.string().trim().min(1, 'Ingrese la fecha de nacimiento'),
    sexoId: z.string().trim().min(1, 'Seleccione el sexo'),
    estadoCivilId: z.string().trim().min(1, 'Estado civil requerido'),
    telefono: z.string().trim().min(1, 'Ingrese el teléfono'),
})

export const recepcionFormSchema = z
    .object({
        modoPaciente: z.enum(['existente', 'nuevo']),
        pacienteId: z.string().trim().optional().default(''),
        pacienteNuevo: pacienteNuevoSchema.partial().optional(),
        tipoAtencionId: z.string().trim().min(1, 'Seleccione un tipo de atención'),
        fechaAtencion: z.string().trim().min(1, 'La fecha es requerida'),
        observaciones: z.string().max(2000).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.modoPaciente === 'existente') {
            if (!data.pacienteId?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Seleccione un paciente',
                    path: ['pacienteId'],
                })
            }
            return
        }

        const result = pacienteNuevoSchema.safeParse(data.pacienteNuevo ?? {})
        if (!result.success) {
            for (const issue of result.error.issues) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: issue.message,
                    path: ['pacienteNuevo', ...issue.path],
                })
            }
        }
    })

export type RecepcionFormValues = z.infer<typeof recepcionFormSchema>

export const recepcionDefaultValues: RecepcionFormValues = {
    modoPaciente: 'existente',
    pacienteId: '',
    pacienteNuevo: {
        tipoDocumentoId: '',
        numeroDocumento: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        sexoId: '',
        estadoCivilId: '',
        telefono: '',
    },
    tipoAtencionId: '',
    fechaAtencion: new Date().toISOString().slice(0, 16),
    observaciones: '',
}

export function toRecepcionarAtencionPayload(
    values: RecepcionFormValues,
): RecepcionarAtencionPayload {
    const base = {
        tipoAtencionId: values.tipoAtencionId,
        fechaAtencion: new Date(values.fechaAtencion).toISOString(),
        observaciones: values.observaciones?.trim() || null,
    }

    if (values.modoPaciente === 'existente') {
        return {
            ...base,
            pacienteId: values.pacienteId,
            pacienteNuevo: null,
        }
    }

    const nuevo = values.pacienteNuevo!
    const pacienteNuevo: RecepcionPacienteNuevoPayload = {
        tipoDocumentoId: nuevo.tipoDocumentoId!,
        numeroDocumento: nuevo.numeroDocumento!.trim(),
        nombres: nuevo.nombres!.trim(),
        apellidoPaterno: nuevo.apellidoPaterno!.trim(),
        apellidoMaterno: (nuevo.apellidoMaterno ?? '').trim(),
        fechaNacimiento: nuevo.fechaNacimiento!,
        sexoId: nuevo.sexoId!,
        estadoCivilId: nuevo.estadoCivilId!,
        telefono: nuevo.telefono!.trim(),
        direccion: null,
    }

    return {
        ...base,
        pacienteId: null,
        pacienteNuevo,
    }
}

/** Schema legacy para edición en modal. */
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
