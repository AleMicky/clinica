import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { gestionesService, periodosService } from '../services/gestiones.service'
import type {
    CreateGestionPayload,
    PeriodoPagedQuery,
    UpdateGestionPayload,
    UpdatePeriodoPayload,
} from '../types/gestiones.types'

export function useGestiones(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.gestiones.list(query),
        queryFn: () => gestionesService.getPaged(query),
    })
}

export function useCreateGestion() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateGestionPayload) => gestionesService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.gestiones.all })
            void qc.invalidateQueries({ queryKey: queryKeys.periodos.all })
            notify.success('Gestión creada', 'Se generaron los 12 periodos automáticamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateGestion() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateGestionPayload
        }) => gestionesService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.gestiones.all })
            notify.success('Gestión actualizada', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteGestion() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => gestionesService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.gestiones.all })
            void qc.invalidateQueries({ queryKey: queryKeys.periodos.all })
            notify.success('Gestión eliminada', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}

export function usePeriodos(query: PeriodoPagedQuery, enabled = true) {
    return useAppQuery({
        queryKey: queryKeys.periodos.list(query),
        queryFn: () => periodosService.getPaged(query),
        enabled,
    })
}

export function useUpdatePeriodo() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdatePeriodoPayload
        }) => periodosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.periodos.all })
            notify.success('Periodo actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar periodo', getApiErrorMessage(e)),
    })
}
