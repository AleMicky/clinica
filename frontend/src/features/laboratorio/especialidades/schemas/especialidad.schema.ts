import { z } from 'zod'

import { createCodigoNombreDescripcionSchema } from '../../../../shared/schemas/codigo-nombre-descripcion.schema'

export const especialidadLabSchema = createCodigoNombreDescripcionSchema().extend({
    orden: z
        .number()
        .int('Debe ser un entero.')
        .min(0, 'El orden no puede ser negativo.'),
})

export type EspecialidadLabFormValues = z.output<typeof especialidadLabSchema>

export const especialidadLabDefaultValues: EspecialidadLabFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    orden: 0,
}
