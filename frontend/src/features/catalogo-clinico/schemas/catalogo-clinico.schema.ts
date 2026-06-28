import { z } from 'zod'

export const catalogoBaseSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'Máximo 50 caracteres.'),
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio.')
        .max(150, 'Máximo 150 caracteres.'),
    descripcion: z
        .string()
        .trim()
        .max(300, 'Máximo 300 caracteres.')
        .optional()
        .nullable(),
})

export const updateCatalogoBaseSchema = catalogoBaseSchema

export type CatalogoBaseFormInput = z.infer<typeof catalogoBaseSchema>
export type CatalogoBaseFormValues = z.output<typeof catalogoBaseSchema>

export const catalogoBaseDefaultValues: CatalogoBaseFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
}

export const departamentoSchema = catalogoBaseSchema.extend({
    areaId: z.string().trim().min(1, 'Seleccione un área.'),
})

export type DepartamentoFormInput = z.infer<typeof departamentoSchema>
export type DepartamentoFormValues = z.output<typeof departamentoSchema>

export const departamentoDefaultValues: DepartamentoFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
    areaId: '',
}

export const servicioSchema = catalogoBaseSchema.extend({
    departamentoId: z.string().trim().min(1, 'Seleccione un departamento.'),
})

export type ServicioFormInput = z.infer<typeof servicioSchema>
export type ServicioFormValues = z.output<typeof servicioSchema>

export const servicioDefaultValues: ServicioFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
    departamentoId: '',
}

export const prestacionSchema = catalogoBaseSchema.extend({
    servicioId: z.string().trim().min(1, 'Seleccione un servicio.'),
    precio: z
        .number({ error: 'Ingrese un precio válido.' })
        .min(0, 'El precio no puede ser negativo.'),
    requiereOrdenMedica: z.boolean(),
    requiereMedico: z.boolean(),
})

export type PrestacionFormInput = z.infer<typeof prestacionSchema>
export type PrestacionFormValues = z.output<typeof prestacionSchema>

export const prestacionDefaultValues: PrestacionFormInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
    servicioId: '',
    precio: 0,
    requiereOrdenMedica: false,
    requiereMedico: false,
}
