export type CuentaEstado = 'ABIERTA' | 'PARCIAL' | 'PAGADA' | 'ANULADA'
export type PagoEstado = 'CONFIRMADO' | 'ANULADO' | 'DEVUELTO' | 'PARCIALMENTE_DEVUELTO'
export type TurnoEstado = 'ABIERTO' | 'CERRADO' | 'ANULADO'

export type Cargo = {
    id: string
    concepto: string
    codigo?: string | null
    cantidad: number
    montoUnitario: number
    montoTotal: number
    moduloOrigen: string
    entidadOrigen: string
    referenciaId: string
    referenciaLineaId?: string | null
    createdAt: string
}

export type Pago = {
    id: string
    numero?: string | null
    monto: number
    metodoPago?: string | null
    estado?: string
    fechaPago: string
    observaciones?: string | null
    createdAt: string
}

export type CuentaListItem = {
    id: string
    numero: string
    pacienteId: string
    moduloOrigen: string
    entidadOrigen: string
    referenciaId: string
    workflowInstanceId?: string | null
    estado: CuentaEstado | string
    totalCargos: number
    totalPagado: number
    saldo: number
    createdAt: string
}

export type Cuenta = CuentaListItem & {
    observaciones?: string | null
    updatedAt?: string | null
    cargos: Cargo[]
    pagos: Pago[]
}

export type CuentaPagedQuery = {
    page?: number
    pageSize?: number
    estado?: string
    pacienteId?: string
    moduloOrigen?: string
    search?: string
}

export type RegistrarPagoDetallePayload = {
    metodoPagoId: string
    importe: number
    numeroReferencia?: string | null
    observaciones?: string | null
}

export type RegistrarPagoPayload = {
    cuentaId: string
    observaciones?: string | null
    detalles: RegistrarPagoDetallePayload[]
    empleadoId?: string | null
}

export type AgregarCargosPayload = {
    pacienteId: string
    moduloOrigen: string
    entidadOrigen: string
    referenciaId: string
    workflowInstanceId?: string | null
    observaciones?: string | null
    lineas: Array<{
        concepto: string
        codigo?: string | null
        cantidad: number
        montoUnitario: number
        referenciaLineaId?: string | null
    }>
}

export type CajaFisica = {
    id: string
    codigo: string
    nombre: string
    descripcion?: string | null
    activo: boolean
    createdAt: string
    updatedAt?: string | null
}

export type CreateCajaPayload = {
    codigo: string
    nombre: string
    descripcion?: string | null
    activo?: boolean
}

export type UpdateCajaPayload = {
    nombre: string
    descripcion?: string | null
    activo: boolean
}

export type TurnoCaja = {
    id: string
    cajaId: string
    cajaCodigo: string
    cajaNombre: string
    usuarioAperturaId: string
    usuarioCierreId?: string | null
    fechaApertura: string
    fechaCierre?: string | null
    montoInicial: number
    montoEsperado?: number | null
    montoContado?: number | null
    diferencia?: number | null
    estado: TurnoEstado | string
    observacionApertura?: string | null
    observacionCierre?: string | null
}

export type AbrirTurnoPayload = {
    cajaId: string
    montoInicial: number
    observacionApertura?: string | null
}

export type MetodoPago = {
    id: string
    codigo: string
    nombre: string
    requiereReferencia: boolean
    esEfectivo: boolean
    activo: boolean
}

export type ConceptoCaja = {
    id: string
    codigo: string
    nombre: string
    tipoMovimiento: string
    activo: boolean
}

export type MovimientoCaja = {
    id: string
    numero: string
    turnoCajaId: string
    conceptoCajaId: string
    conceptoCodigo: string
    conceptoNombre: string
    tipoMovimiento: string
    fecha: string
    importe: number
    metodoPagoId?: string | null
    metodoPagoCodigo?: string | null
    pagoId?: string | null
    descripcion?: string | null
    estado: string
    createdBy?: string | null
}

export type ResumenTurno = {
    turnoId: string
    montoInicial: number
    ingresos: number
    egresos: number
    ingresosEfectivo: number
    egresosEfectivo: number
    efectivoEsperado: number
    totalMovimientos: number
}

export type ArqueoCaja = {
    id: string
    turnoCajaId: string
    fecha: string
    montoInicial: number
    ingresosEfectivo: number
    egresosEfectivo: number
    montoEsperado: number
    montoContado: number
    diferencia: number
    observaciones?: string | null
    realizadoPor: string
}

export type Recibo = {
    id: string
    numero: string
    pagoId: string
    pacienteId: string
    fechaEmision: string
    importe: number
    estado: string
    observaciones?: string | null
}

export type PagoDetalleCompleto = {
    id: string
    numero: string
    pacienteId: string
    cuentaId: string
    turnoCajaId?: string | null
    fechaPago: string
    monto: number
    estado: string
    observaciones?: string | null
    createdAt: string
    detalles: Array<{
        id: string
        metodoPagoId: string
        metodoPagoCodigo: string
        metodoPagoNombre: string
        importe: number
        numeroReferencia?: string | null
        observaciones?: string | null
    }>
    aplicaciones: Array<{
        id: string
        cuentaId: string
        cuentaNumero: string
        importeAplicado: number
    }>
    recibo?: Recibo | null
}

export type MovimientoPagedQuery = {
    page?: number
    pageSize?: number
    turnoCajaId?: string
    tipoMovimiento?: string
    conceptoCajaId?: string
    metodoPagoId?: string
    estado?: string
}

export type RegistrarMovimientoPayload = {
    conceptoCajaId: string
    importe: number
    metodoPagoId?: string | null
    descripcion?: string | null
}

export type CerrarArqueoPayload = {
    montoContado: number
    observaciones?: string | null
}
