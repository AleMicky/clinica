import { z } from 'zod'

import type { CrearRecepcionAtencionPayload } from '../types/recepcion.types'

const respuestaSchema = z.object({
    formularioCampoId: z.string().min(1),
    valorTexto: z.string().nullable().optional(),
    valorNumero: z.number().nullable().optional(),
    valorFecha: z.string().nullable().optional(),
    valorBooleano: z.boolean().nullable().optional(),
    valorJson: z.string().nullable().optional(),
})

export const recepcionWizardSchema = z.object({
    pacienteId: z.string().trim().min(1, 'Seleccione un paciente'),
    tipoAtencionId: z.string().trim().min(1, 'Seleccione un tipo de atención'),
    respuestasFormulario: z.array(respuestaSchema),
})

export type RecepcionWizardValues = z.infer<typeof recepcionWizardSchema>

export function toCrearRecepcionPayload(
    values: RecepcionWizardValues,
): CrearRecepcionAtencionPayload {
    return {
        pacienteId: values.pacienteId,
        tipoAtencionId: values.tipoAtencionId,
        respuestasFormulario: values.respuestasFormulario,
    }
}
