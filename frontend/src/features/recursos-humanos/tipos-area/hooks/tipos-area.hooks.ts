import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { tiposAreaService } from '../services/tipos-area.service'
import type {
    CreateTipoAreaPayload,
    UpdateTipoAreaPayload,
} from '../types/tipo-area.types'

export function useTiposArea(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.tiposArea.list(query),
        queryFn: () => tiposAreaService.getPaged(query),
    })
}

export function useCreateTipoArea() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateTipoAreaPayload) => tiposAreaService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.tiposArea.all,
            })
            notify.success('Tipo de área creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateTipoArea() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateTipoAreaPayload
        }) => tiposAreaService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.tiposArea.all,
            })
            notify.success('Tipo de área actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteTipoArea() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => tiposAreaService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.tiposArea.all,
            })
            notify.success('Tipo de área eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
