import type { PagedQuery } from '../../../../shared/types/pagination.types'

export const RESULTADO_ESTADO_LABELS: Record<string, string> = {
    REGISTRADO: 'Registrado',
    VALIDADO: 'Validado',
    ENTREGADO: 'Entregado',
}

export const RESULTADO_ESTADO_COLORS: Record<string, string> = {
    REGISTRADO: 'processing',
    VALIDADO: 'success',
    ENTREGADO: 'default',
}

export type ResultadoDetalle = {
    id: string
    parametroId: string
    parametroNombre: string
    solicitudDetalleId: string
    valorNumerico?: number | null
    valorTexto?: string | null
    fueraDeRango: boolean
    observaciones?: string | null
}

export type Resultado = {
    id: string
    solicitudId: string
    muestraId?: string | null
    estado: string
    validadoPorEmpleadoId?: string | null
    fechaValidacion?: string | null
    observaciones?: string | null
    detalles: ResultadoDetalle[]
}

export type ResultadoPagedQuery = PagedQuery & {
    solicitudId?: string
    estado?: string
}

export type RegistrarResultadoLineaPayload = {
    parametroId: string
    solicitudDetalleId: string
    valorNumerico?: number | null
    valorTexto?: string | null
    observaciones?: string | null
}

export type RegistrarResultadosPayload = {
    muestraId?: string | null
    observaciones?: string | null
    empleadoId: string
    lineas: RegistrarResultadoLineaPayload[]
}

export type ValidarResultadoPayload = {
    empleadoId: string
    observaciones?: string | null
}

export type EntregarResultadoPayload = ValidarResultadoPayload
