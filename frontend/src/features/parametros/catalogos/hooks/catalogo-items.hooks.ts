import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { catalogoItemsService } from '../services/catalogo-items.service'
import type {
    CreateCatalogoItemPayload,
    UpdateCatalogoItemPayload,
} from '../types/catalogo.types'

function invalidateCatalogoItems(queryClient: ReturnType<typeof useQueryClient>) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalogoGrupos.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalogoItems.all })
}

export function useCreateCatalogoItem() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateCatalogoItemPayload) =>
            catalogoItemsService.create(data),
        onSuccess: () => {
            invalidateCatalogoItems(queryClient)
            notify.success('Ítem creado', 'El ítem se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear ítem', getApiErrorMessage(error))
        },
    })
}

export function useUpdateCatalogoItem() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateCatalogoItemPayload
        }) => catalogoItemsService.update(id, data),
        onSuccess: () => {
            invalidateCatalogoItems(queryClient)
            notify.success('Ítem actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar ítem', getApiErrorMessage(error))
        },
    })
}

export function useDeleteCatalogoItem() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => catalogoItemsService.delete(id),
        onSuccess: () => {
            invalidateCatalogoItems(queryClient)
            notify.success('Ítem desactivado', 'El ítem se desactivó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al desactivar ítem', getApiErrorMessage(error))
        },
    })
}
