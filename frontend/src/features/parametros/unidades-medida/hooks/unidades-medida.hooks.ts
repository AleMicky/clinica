import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { unidadesMedidaService } from '../services/unidades-medida.service'
import type {
    CreateUnidadMedidaPayload,
    UpdateUnidadMedidaPayload,
} from '../types/unidades-medida.types'

export function useUnidadesMedida(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.unidadesMedida.list(query),
        queryFn: () => unidadesMedidaService.getPaged(query),
    })
}

export function useCreateUnidadMedida() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateUnidadMedidaPayload) =>
            unidadesMedidaService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.unidadesMedida.all })
            notify.success('Unidad creada', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateUnidadMedida() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateUnidadMedidaPayload
        }) => unidadesMedidaService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.unidadesMedida.all })
            notify.success('Unidad actualizada', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteUnidadMedida() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => unidadesMedidaService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.unidadesMedida.all })
            notify.success('Unidad desactivada', 'Se desactivó correctamente.')
        },
        onError: (e) => notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}
