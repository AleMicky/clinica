import type { PagedQuery } from '../../../../shared/types/pagination.types'

export const SolicitudOrigen = {
    AtencionMedica: 'ATENCION_MEDICA',
    Paciente: 'PACIENTE',
    MedicoExterno: 'MEDICO_EXTERNO',
} as const

export type SolicitudOrigenValue = (typeof SolicitudOrigen)[keyof typeof SolicitudOrigen]

export const SOLICITUD_ORIGEN_OPTIONS: { value: SolicitudOrigenValue; label: string }[] = [
    { value: SolicitudOrigen.Paciente, label: 'Paciente (mostrador)' },
    { value: SolicitudOrigen.AtencionMedica, label: 'Atención médica' },
    { value: SolicitudOrigen.MedicoExterno, label: 'Médico externo' },
]

export const SOLICITUD_ORIGEN_LABELS: Record<string, string> = Object.fromEntries(
    SOLICITUD_ORIGEN_OPTIONS.map((option) => [option.value, option.label]),
)

export const SOLICITUD_ESTADO_LABELS: Record<string, string> = {
    BORRADOR: 'Borrador',
    PENDIENTE_PAGO: 'Pendiente de pago',
    PENDIENTE_MUESTRA: 'Pendiente de muestra',
    MUESTRA_TOMADA: 'Muestra tomada',
    EN_PROCESO: 'En proceso',
    RESULTADO_REGISTRADO: 'Resultado registrado',
    VALIDADO: 'Validado',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
}

export const SOLICITUD_ESTADO_COLORS: Record<string, string> = {
    BORRADOR: 'default',
    PENDIENTE_PAGO: 'gold',
    PENDIENTE_MUESTRA: 'blue',
    MUESTRA_TOMADA: 'cyan',
    EN_PROCESO: 'processing',
    RESULTADO_REGISTRADO: 'purple',
    VALIDADO: 'green',
    ENTREGADO: 'success',
    CANCELADO: 'error',
}

export type SolicitudDetalle = {
    id: string
    pruebaId: string
    pruebaNombre: string
    precioUnitario: number
    cantidad: number
    esDerivada: boolean
    laboratorioExternoId?: string | null
    laboratorioExternoNombre?: string | null
    observaciones?: string | null
}

export type SolicitudPago = {
    id: string
    cuentaId: string
    montoTotal: number
    fechaEnvio: string
    estado: string
}

export type Solicitud = {
    id: string
    numero: string
    pacienteId: string
    origen: string
    atencionId?: string | null
    medicoSolicitanteId?: string | null
    medicoExternoNombre?: string | null
    estado: string
    observaciones?: string | null
    fechaSolicitud: string
    detalles: SolicitudDetalle[]
    pagos: SolicitudPago[]
}

export type CreateSolicitudLineaPayload = {
    pruebaId: string
    cantidad: number
    observaciones?: string | null
}

export type CreateSolicitudPayload = {
    pacienteId: string
    origen: string
    atencionId?: string | null
    medicoSolicitanteId?: string | null
    medicoExternoNombre?: string | null
    observaciones?: string | null
    empleadoId: string
    lineas: CreateSolicitudLineaPayload[]
}

export type EnviarACajaPayload = {
    empleadoId: string
}

export type DerivarDetallePayload = {
    laboratorioExternoId: string
    observaciones?: string | null
}

export type SolicitudPagedQuery = PagedQuery & {
    pacienteId?: string
    atencionId?: string
    estado?: string
    origen?: string
}
