/** Espejo de la regla de negocio del backend: solo pagos CONFIRMADO del turno abierto. */
export function canAnularPago(opts: {
    estado?: string | null
    turnoCajaId?: string | null
    turnoAbiertoId?: string | null
}): boolean {
    return (
        opts.estado === 'CONFIRMADO' &&
        Boolean(opts.turnoCajaId) &&
        Boolean(opts.turnoAbiertoId) &&
        opts.turnoCajaId === opts.turnoAbiertoId
    )
}

export const ANULAR_PAGO_DISABLED_HINT =
    'Solo se pueden anular pagos confirmados del turno abierto actual.'
