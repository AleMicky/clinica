import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { catalogoGruposService } from '../services/catalogo-grupos.service'
import type {
    CreateCatalogoGrupoPayload,
    UpdateCatalogoGrupoPayload,
} from '../types/catalogo.types'

export function useCatalogoGrupos(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.catalogoGrupos.list(query),
        queryFn: () => catalogoGruposService.getPaged(query),
    })
}

export function useCatalogoGruposGrouped() {
    return useAppQuery({
        queryKey: [...queryKeys.catalogoGrupos.all, 'grouped'] as const,
        queryFn: () => catalogoGruposService.getGroupedItems(),
        staleTime: 5 * 60 * 1000,
    })
}

export function useCatalogoGrupoItems(grupoId: string | null) {
    return useAppQuery({
        queryKey: queryKeys.catalogoGrupos.items(grupoId ?? ''),
        queryFn: () => catalogoGruposService.getItemsByGrupo(grupoId!),
        enabled: grupoId !== null,
    })
}

export function useCreateCatalogoGrupo() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateCatalogoGrupoPayload) =>
            catalogoGruposService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.catalogoGrupos.all,
            })
            notify.success('Grupo creado', 'El catálogo se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear grupo', getApiErrorMessage(error))
        },
    })
}

export function useUpdateCatalogoGrupo() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateCatalogoGrupoPayload
        }) => catalogoGruposService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.catalogoGrupos.all,
            })
            notify.success('Grupo actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar grupo', getApiErrorMessage(error))
        },
    })
}

export function useDeleteCatalogoGrupo() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => catalogoGruposService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.catalogoGrupos.all,
            })
            notify.success('Grupo desactivado', 'El catálogo se desactivó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al desactivar grupo', getApiErrorMessage(error))
        },
    })
}
