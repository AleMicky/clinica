import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { cajaService } from '../services/caja.service'
import type {
    AbrirTurnoPayload,
    CerrarArqueoPayload,
    CreateCajaPayload,
    CuentaPagedQuery,
    MovimientoPagedQuery,
    RegistrarMovimientoPayload,
    RegistrarPagoPayload,
    UpdateCajaPayload,
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
        queryKey: queryKeys.caja.metodosPago,
        queryFn: () => cajaService.getMetodosPago(),
    })
}

export function useConceptosCaja() {
    return useAppQuery({
        queryKey: queryKeys.caja.conceptos,
        queryFn: () => cajaService.getConceptos(),
    })
}

export function useMovimientos(query: MovimientoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.caja.movimientos.list(query),
        queryFn: () => cajaService.getMovimientos(query),
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
