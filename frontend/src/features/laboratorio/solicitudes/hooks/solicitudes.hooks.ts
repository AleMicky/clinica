import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { solicitudesService } from '../services/solicitudes.service'
import type {
    CreateSolicitudPayload,
    DerivarDetallePayload,
    EnviarACajaPayload,
    SolicitudPagedQuery,
    UpdateSolicitudPayload,
} from '../types/solicitud.types'

export function useSolicitudes(query: SolicitudPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.solicitudes.list(query),
        queryFn: () => solicitudesService.getPaged(query),
    })
}

export function useSolicitud(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.solicitudes.detail(id ?? ''),
        queryFn: () => solicitudesService.getById(id!),
        enabled: Boolean(id),
    })
}

export function useCreateSolicitud() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateSolicitudPayload) => solicitudesService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Solicitud creada', 'La solicitud se registró correctamente.')
        },
        onError: (e) => notify.error('Error al crear la solicitud', getApiErrorMessage(e)),
    })
}

export function useUpdateSolicitud() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSolicitudPayload }) =>
            solicitudesService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Solicitud actualizada', 'Los cambios se guardaron correctamente.')
        },
        onError: (e) => notify.error('Error al actualizar la solicitud', getApiErrorMessage(e)),
    })
}

export function useDeleteSolicitud() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => solicitudesService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Solicitud eliminada', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar la solicitud', getApiErrorMessage(e)),
    })
}

export function useEnviarACaja() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: EnviarACajaPayload }) =>
            solicitudesService.enviarACaja(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Solicitud enviada a caja', 'Se generó el cargo correspondiente.')
        },
        onError: (e) => notify.error('Error al enviar a caja', getApiErrorMessage(e)),
    })
}

export function useDerivarDetalle() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            detalleId,
            data,
        }: {
            id: string
            detalleId: string
            data: DerivarDetallePayload
        }) => solicitudesService.derivarDetalle(id, detalleId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Prueba derivada', 'La prueba se derivó correctamente.')
        },
        onError: (e) => notify.error('Error al derivar', getApiErrorMessage(e)),
    })
}
