import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { pruebasService } from '../services/pruebas.service'
import type {
    CreatePruebaPayload,
    UpdatePruebaPayload,
} from '../types/prueba.types'

export function usePruebas(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.pruebas.list(query),
        queryFn: () => pruebasService.getPaged(query),
    })
}

export function useCreatePrueba() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreatePruebaPayload) => pruebasService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebas.all,
            })
            notify.success('Prueba creada', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdatePrueba() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdatePruebaPayload
        }) => pruebasService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebas.all,
            })
            notify.success('Prueba actualizada', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeletePrueba() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => pruebasService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebas.all,
            })
            notify.success('Prueba eliminada', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
