import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type ValorReferencia = {
    id: string
    parametroId: string
    sexo?: string | null
    edadMin?: number | null
    edadMax?: number | null
    valorMin?: number | null
    valorMax?: number | null
    valorTexto?: string | null
    activo: boolean
}

export type CreateValorReferenciaPayload = {
    parametroId: string
    sexo?: string | null
    edadMin?: number | null
    edadMax?: number | null
    valorMin?: number | null
    valorMax?: number | null
    valorTexto?: string | null
    activo: boolean
}

export type UpdateValorReferenciaPayload = CreateValorReferenciaPayload

export type ValorReferenciaPagedQuery = PagedQuery & {
    parametroId?: string
}

export const VALOR_REFERENCIA_SEXO_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
] as const
