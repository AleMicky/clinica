import { z } from 'zod'

import { createCodigoNombreDescripcionSchema } from '../../../../shared/schemas/codigo-nombre-descripcion.schema'

export const tipoAreaSchema = createCodigoNombreDescripcionSchema().extend({
    orden: z
        .number()
        .int('Debe ser un entero.')
        .min(0, 'El orden no puede ser negativo.'),
})

export type TipoAreaFormValues = z.output<typeof tipoAreaSchema>

export const tipoAreaDefaultValues: TipoAreaFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    orden: 0,
}
