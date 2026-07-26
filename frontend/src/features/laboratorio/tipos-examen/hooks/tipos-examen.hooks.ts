import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { tiposExamenService } from '../services/tipos-examen.service'
import type {
    CreateTipoExamenPayload,
    UpdateTipoExamenPayload,
} from '../types/tipo-examen.types'

export function useTiposExamen(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.tiposExamen.list(query),
        queryFn: () => tiposExamenService.getPaged(query),
    })
}

export function useCreateTipoExamen() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateTipoExamenPayload) =>
            tiposExamenService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.tiposExamen.all,
            })
            notify.success('Tipo de examen creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateTipoExamen() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateTipoExamenPayload
        }) => tiposExamenService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.tiposExamen.all,
            })
            notify.success('Tipo de examen actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteTipoExamen() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => tiposExamenService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.tiposExamen.all,
            })
            notify.success('Tipo de examen eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
