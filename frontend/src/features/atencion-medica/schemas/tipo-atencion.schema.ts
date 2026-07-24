import { z } from 'zod'

import {
    DEFAULT_TIPO_ATENCION_COLOR,
    DEFAULT_TIPO_ATENCION_ICONO,
} from '../constants/tipo-atencion-icons'

export const tipoAtencionFormSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio.')
        .max(200, 'Máximo 200 caracteres.'),
    descripcion: z
        .string()
        .trim()
        .max(500, 'Máximo 500 caracteres.')
        .optional()
        .nullable(),
    color: z
        .string()
        .trim()
        .min(1, 'El color es obligatorio.')
        .max(20, 'Máximo 20 caracteres.'),
    icono: z
        .string()
        .trim()
        .min(1, 'Seleccione un icono.')
        .max(50, 'Máximo 50 caracteres.'),
})

export type TipoAtencionFormValues = z.output<typeof tipoAtencionFormSchema>

export const tipoAtencionFormDefaultValues: TipoAtencionFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    color: DEFAULT_TIPO_ATENCION_COLOR,
    icono: DEFAULT_TIPO_ATENCION_ICONO,
}
