import { z } from 'zod'

import { createCodigoNombreDescripcionSchema } from '../../../shared/schemas/codigo-nombre-descripcion.schema'

export const cajaSchema = createCodigoNombreDescripcionSchema().extend({
    activo: z.boolean(),
})

export type CajaFormValues = z.output<typeof cajaSchema>

export const cajaDefaultValues: CajaFormValues = {
    codigo: '',
    nombre: '',
    descripcion: '',
    activo: true,
}
