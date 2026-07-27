import type { PagedQuery } from '../../../../shared/types/pagination.types'

export const ParametroTipoDato = {
    Numerico: 'NUMERICO',
    Texto: 'TEXTO',
    Booleano: 'BOOLEANO',
} as const

export type ParametroTipoDatoValue =
    (typeof ParametroTipoDato)[keyof typeof ParametroTipoDato]

export const PARAMETRO_TIPO_DATO_OPTIONS: {
    value: ParametroTipoDatoValue
    label: string
}[] = [
    { value: ParametroTipoDato.Numerico, label: 'Numérico' },
    { value: ParametroTipoDato.Texto, label: 'Texto' },
    { value: ParametroTipoDato.Booleano, label: 'Booleano' },
]

export type Parametro = {
    id: string
    pruebaId: string
    pruebaNombre: string
    codigo: string
    nombre: string
    unidadMedidaId?: string | null
    tipoDato: string
    orden: number
    activo: boolean
}

export type CreateParametroPayload = {
    pruebaId: string
    codigo: string
    nombre: string
    unidadMedidaId?: string | null
    tipoDato: string
    orden: number
    activo: boolean
}

export type UpdateParametroPayload = Omit<CreateParametroPayload, 'pruebaId'>

export type ParametroPagedQuery = PagedQuery & {
    pruebaId?: string
}
