import { get, getPaged, patch, post, put, del } from '../../../shared/api/http'
import { cajaEndpoints } from '../../../shared/api/endpoints'
import type {
    AbrirTurnoPayload,
    AgregarCargosPayload,
    ArqueoCaja,
    CajaFisica,
    CerrarArqueoPayload,
    ConceptoCaja,
    CreateCajaPayload,
    CreateMetodoPagoPayload,
    Cuenta,
    CuentaListItem,
    CuentaPagedQuery,
    MetodoPago,
    MovimientoCaja,
    MovimientoPagedQuery,
    PagoDetalleCompleto,
    RegistrarMovimientoPayload,
    RegistrarPagoPayload,
    ResumenTurno,
    TurnoCaja,
    UpdateCajaPayload,
    UpdateMetodoPagoPayload,
} from '../types/caja.types'

export const cajaService = {
    getPaged(query: CuentaPagedQuery) {
        return getPaged<CuentaListItem>(cajaEndpoints.cuentas.root, query)
    },

    getById(id: string) {
        return get<Cuenta>(cajaEndpoints.cuentas.byId(id))
    },

    getByReferencia(moduloOrigen: string, entidadOrigen: string, referenciaId: string) {
        return get<Cuenta>(
            cajaEndpoints.cuentas.byReferencia(moduloOrigen, entidadOrigen, referenciaId),
        )
    },

    agregarCargos(payload: AgregarCargosPayload) {
        return post<Cuenta, AgregarCargosPayload>(cajaEndpoints.cuentas.cargos, payload)
    },

    registrarPago(id: string, payload: Omit<RegistrarPagoPayload, 'cuentaId'> & { cuentaId?: string }) {
        return post<PagoDetalleCompleto, RegistrarPagoPayload>(cajaEndpoints.cuentas.pagos(id), {
            cuentaId: id,
            observaciones: payload.observaciones,
            detalles: payload.detalles,
            empleadoId: payload.empleadoId,
        })
    },

    anular(id: string, motivo?: string) {
        return post<string, { motivo?: string }>(cajaEndpoints.cuentas.anular(id), {
            motivo,
        })
    },

    getCajas(query: { page?: number; pageSize?: number; search?: string; activo?: boolean } = {}) {
        return getPaged<CajaFisica>(cajaEndpoints.cajas.root, query)
    },

    createCaja(payload: CreateCajaPayload) {
        return post<CajaFisica, CreateCajaPayload>(cajaEndpoints.cajas.root, payload)
    },

    updateCaja(id: string, payload: UpdateCajaPayload) {
        return put<CajaFisica, UpdateCajaPayload>(cajaEndpoints.cajas.byId(id), payload)
    },

    changeCajaStatus(id: string, activo: boolean) {
        return patch<string, { activo: boolean }>(cajaEndpoints.cajas.estado(id), { activo })
    },

    getTurnoAbierto() {
        return get<TurnoCaja | null>(cajaEndpoints.turnos.abierto)
    },

    abrirTurno(payload: AbrirTurnoPayload) {
        return post<TurnoCaja, AbrirTurnoPayload>(cajaEndpoints.turnos.abrir, payload)
    },

    getResumenTurno(turnoId: string) {
        return get<ResumenTurno>(cajaEndpoints.turnos.resumen(turnoId))
    },

    getArqueo(turnoId: string) {
        return get<ArqueoCaja>(cajaEndpoints.turnos.arqueo(turnoId))
    },

    cerrarArqueo(turnoId: string, payload: CerrarArqueoPayload) {
        return post<ArqueoCaja, CerrarArqueoPayload>(cajaEndpoints.turnos.arqueo(turnoId), payload)
    },

    getMovimientos(query: MovimientoPagedQuery) {
        return getPaged<MovimientoCaja>(cajaEndpoints.movimientos.root, query)
    },

    registrarIngreso(payload: RegistrarMovimientoPayload) {
        return post<MovimientoCaja, RegistrarMovimientoPayload>(
            cajaEndpoints.movimientos.ingreso,
            payload,
        )
    },

    registrarEgreso(payload: RegistrarMovimientoPayload) {
        return post<MovimientoCaja, RegistrarMovimientoPayload>(
            cajaEndpoints.movimientos.egreso,
            payload,
        )
    },

    getMetodosPago() {
        return get<MetodoPago[]>(cajaEndpoints.metodosPago.root)
    },

    createMetodoPago(payload: CreateMetodoPagoPayload) {
        return post<MetodoPago, CreateMetodoPagoPayload>(
            cajaEndpoints.metodosPago.root,
            payload,
        )
    },

    updateMetodoPago(id: string, payload: UpdateMetodoPagoPayload) {
        return put<MetodoPago, UpdateMetodoPagoPayload>(
            cajaEndpoints.metodosPago.byId(id),
            payload,
        )
    },

    deleteMetodoPago(id: string) {
        return del<string>(cajaEndpoints.metodosPago.byId(id))
    },

    getConceptos() {
        return get<ConceptoCaja[]>(cajaEndpoints.conceptos)
    },
}
