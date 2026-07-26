import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { pruebaPreciosService } from '../services/prueba-precios.service'
import type {
    CreatePruebaPrecioPayload,
    PruebaPrecioPagedQuery,
    UpdatePruebaPrecioPayload,
} from '../types/prueba-precio.types'

export function usePruebaPrecios(
    query: PruebaPrecioPagedQuery,
    enabled = true,
) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.pruebaPrecios.list(query),
        queryFn: () => pruebaPreciosService.getPaged(query),
        enabled: enabled && Boolean(query.pruebaId),
    })
}

export function useCreatePruebaPrecio() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreatePruebaPrecioPayload) =>
            pruebaPreciosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebaPrecios.all,
            })
            notify.success('Precio creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdatePruebaPrecio() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdatePruebaPrecioPayload
        }) => pruebaPreciosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebaPrecios.all,
            })
            notify.success('Precio actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeletePruebaPrecio() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => pruebaPreciosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.pruebaPrecios.all,
            })
            notify.success('Precio eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
