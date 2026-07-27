import { z } from 'zod'

import { SolicitudOrigen } from '../types/solicitud.types'

export const solicitudLineaSchema = z.object({
    pruebaId: z.string().min(1, 'Seleccione una prueba.'),
    cantidad: z
        .number()
        .min(1, 'La cantidad debe ser mayor a 0.'),
    observaciones: z.string().max(500, 'Máximo 500 caracteres.').nullable(),
})

export type SolicitudLineaFormValues = z.output<typeof solicitudLineaSchema>

export const solicitudSchema = z
    .object({
        pacienteId: z.string().min(1, 'Seleccione un paciente.'),
        origen: z.enum(
            [SolicitudOrigen.Paciente, SolicitudOrigen.AtencionMedica, SolicitudOrigen.MedicoExterno],
            { message: 'Seleccione un origen.' },
        ),
        atencionId: z.string().nullable(),
        medicoSolicitanteId: z.string().nullable(),
        medicoExternoNombre: z.string().max(200, 'Máximo 200 caracteres.').nullable(),
        observaciones: z.string().max(500, 'Máximo 500 caracteres.').nullable(),
        empleadoId: z.string().min(1, 'Seleccione el empleado que registra.'),
        lineas: z.array(solicitudLineaSchema).min(1, 'Agregue al menos una prueba.'),
    })
    .superRefine((values, ctx) => {
        if (values.origen === SolicitudOrigen.AtencionMedica && !values.atencionId) {
            ctx.addIssue({
                code: 'custom',
                path: ['atencionId'],
                message: 'Indique la atención médica asociada.',
            })
        }

        if (values.origen === SolicitudOrigen.MedicoExterno && !values.medicoExternoNombre?.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['medicoExternoNombre'],
                message: 'Indique el nombre del médico externo.',
            })
        }

        const pruebaIds = values.lineas.map((linea) => linea.pruebaId).filter(Boolean)
        if (new Set(pruebaIds).size !== pruebaIds.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['lineas'],
                message: 'No repita la misma prueba en varias líneas.',
            })
        }
    })

export type SolicitudFormValues = z.output<typeof solicitudSchema>

export const solicitudLineaDefaultValues: SolicitudLineaFormValues = {
    pruebaId: '',
    cantidad: 1,
    observaciones: null,
}

export const solicitudDefaultValues: SolicitudFormValues = {
    pacienteId: '',
    origen: SolicitudOrigen.Paciente,
    atencionId: null,
    medicoSolicitanteId: null,
    medicoExternoNombre: null,
    observaciones: null,
    empleadoId: '',
    lineas: [{ ...solicitudLineaDefaultValues }],
}
