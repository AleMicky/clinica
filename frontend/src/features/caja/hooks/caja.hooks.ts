import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { cajaService } from '../services/caja.service'
import type {
    AbrirTurnoPayload,
    AnularPagoPayload,
    CerrarArqueoPayload,
    CreateCajaPayload,
    CreateConceptoCajaPayload,
    CreateMetodoPagoPayload,
    CuentaPagedQuery,
    MovimientoPagedQuery,
    PagoPagedQuery,
    RegistrarMovimientoPayload,
    RegistrarPagoPayload,
    TurnoPagedQuery,
    UpdateCajaPayload,
    UpdateConceptoCajaPayload,
    UpdateMetodoPagoPayload,
} from '../types/caja.types'

export function useCuentas(query: CuentaPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.caja.cuentas.list(query),
        queryFn: () => cajaService.getPaged(query),
    })
}

export function useCuenta(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.caja.cuentas.detail(id ?? ''),
        queryFn: () => cajaService.getById(id!),
        enabled: Boolean(id),
    })
}

export function useTurnos(query: TurnoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.caja.turnos.list(query),
        queryFn: () => cajaService.getTurnos(query),
    })
}

export function useTurnoAbierto() {
    return useAppQuery({
        queryKey: queryKeys.caja.turnos.abierto,
        queryFn: () => cajaService.getTurnoAbierto(),
        retry: false,
    })
}

export function useResumenTurno(turnoId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.caja.turnos.resumen(turnoId ?? ''),
        queryFn: () => cajaService.getResumenTurno(turnoId!),
        enabled: Boolean(turnoId),
    })
}

export function useArqueo(turnoId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.caja.turnos.arqueo(turnoId ?? ''),
        queryFn: () => cajaService.getArqueo(turnoId!),
        enabled: Boolean(turnoId),
    })
}

export function useCajas(query: { page?: number; pageSize?: number; search?: string; activo?: boolean } = {}) {
    return useAppQuery({
        queryKey: queryKeys.caja.cajas.list(query),
        queryFn: () => cajaService.getCajas(query),
    })
}

export function useMetodosPago() {
    return useAppQuery({
        queryKey: queryKeys.caja.metodosPago.list,
        queryFn: () => cajaService.getMetodosPago(),
    })
}

export function useConceptosCaja() {
    return useAppQuery({
        queryKey: queryKeys.caja.conceptos.list,
        queryFn: () => cajaService.getConceptos(),
    })
}

export function useMovimientos(query: MovimientoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.caja.movimientos.list(query),
        queryFn: () => cajaService.getMovimientos(query),
    })
}

export function usePagos(query: PagoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.caja.pagos.list(query),
        queryFn: () => cajaService.getPagos(query),
    })
}

export function usePago(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.caja.pagos.detail(id ?? ''),
        queryFn: () => cajaService.getPagoById(id!),
        enabled: Boolean(id),
    })
}

export function useRecibo(pagoId: string | undefined) {
    // Sin notify global: el drawer muestra “Sin recibo asociado” ante 404.
    return useQuery({
        queryKey: queryKeys.caja.pagos.recibo(pagoId ?? ''),
        queryFn: () => cajaService.getRecibo(pagoId!),
        enabled: Boolean(pagoId),
        retry: false,
    })
}

export function useAnularPago() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AnularPagoPayload }) =>
            cajaService.anularPago(id, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.all })
            notify.success('Pago anulado', 'El pago se anuló correctamente.')
        },
        onError: (e) => notify.error('Error al anular pago', getApiErrorMessage(e)),
    })
}

export function useAbrirTurno() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: AbrirTurnoPayload) => cajaService.abrirTurno(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.turnos.all })
            notify.success('Turno abierto', 'Puede comenzar a operar la caja.')
        },
        onError: (e) => notify.error('Error al abrir turno', getApiErrorMessage(e)),
    })
}

export function useCerrarArqueo() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ turnoId, payload }: { turnoId: string; payload: CerrarArqueoPayload }) =>
            cajaService.cerrarArqueo(turnoId, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.all })
            notify.success('Caja cerrada', 'Arqueo confirmado y turno cerrado.')
        },
        onError: (e) => notify.error('Error al cerrar caja', getApiErrorMessage(e)),
    })
}

export function useRegistrarPago() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: Omit<RegistrarPagoPayload, 'cuentaId'>
        }) => cajaService.registrarPago(id, payload),
        onSuccess: (data) => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.all })
            notify.success(
                'Pago registrado',
                `Pago ${data.numero}${data.recibo ? ` · Recibo ${data.recibo.numero}` : ''}`,
            )
        },
        onError: (e) => notify.error('Error al registrar pago', getApiErrorMessage(e)),
    })
}

export function useAnularCuenta() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => cajaService.anular(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.cuentas.all })
            notify.success('Cuenta anulada', 'La cuenta se anuló correctamente.')
        },
        onError: (e) => notify.error('Error al anular', getApiErrorMessage(e)),
    })
}

export function useRegistrarIngreso() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: RegistrarMovimientoPayload) => cajaService.registrarIngreso(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.all })
            notify.success('Ingreso registrado', 'Movimiento de ingreso guardado.')
        },
        onError: (e) => notify.error('Error al registrar ingreso', getApiErrorMessage(e)),
    })
}

export function useRegistrarEgreso() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: RegistrarMovimientoPayload) => cajaService.registrarEgreso(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.all })
            notify.success('Egreso registrado', 'Movimiento de egreso guardado.')
        },
        onError: (e) => notify.error('Error al registrar egreso', getApiErrorMessage(e)),
    })
}

export function useCreateCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: CreateCajaPayload) => cajaService.createCaja(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.cajas.all })
            notify.success('Caja creada', 'La caja se registró correctamente.')
        },
        onError: (e) => notify.error('Error al crear caja', getApiErrorMessage(e)),
    })
}

export function useUpdateCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCajaPayload }) =>
            cajaService.updateCaja(id, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.cajas.all })
            notify.success('Caja actualizada', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar caja', getApiErrorMessage(e)),
    })
}

export function useDeleteCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => cajaService.deleteCaja(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.cajas.all })
            notify.success('Caja eliminada', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar caja', getApiErrorMessage(e)),
    })
}

export function useCreateMetodoPago() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: CreateMetodoPagoPayload) => cajaService.createMetodoPago(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.metodosPago.all })
            notify.success('Método de pago creado', 'Se registró correctamente.')
        },
        onError: (e) => notify.error('Error al crear método de pago', getApiErrorMessage(e)),
    })
}

export function useUpdateMetodoPago() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateMetodoPagoPayload }) =>
            cajaService.updateMetodoPago(id, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.metodosPago.all })
            notify.success('Método de pago actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar método de pago', getApiErrorMessage(e)),
    })
}

export function useDeleteMetodoPago() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => cajaService.deleteMetodoPago(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.metodosPago.all })
            notify.success('Método de pago eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar método de pago', getApiErrorMessage(e)),
    })
}

export function useCreateConceptoCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (payload: CreateConceptoCajaPayload) => cajaService.createConcepto(payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.conceptos.all })
            notify.success('Concepto creado', 'Se registró correctamente.')
        },
        onError: (e) => notify.error('Error al crear concepto', getApiErrorMessage(e)),
    })
}

export function useUpdateConceptoCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateConceptoCajaPayload }) =>
            cajaService.updateConcepto(id, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.conceptos.all })
            notify.success('Concepto actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar concepto', getApiErrorMessage(e)),
    })
}

export function useDeleteConceptoCaja() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => cajaService.deleteConcepto(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.caja.conceptos.all })
            notify.success('Concepto eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar concepto', getApiErrorMessage(e)),
    })
}
