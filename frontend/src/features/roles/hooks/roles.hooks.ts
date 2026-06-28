import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { rolesService } from '../services/roles.service'
import type { CreateRolePayload, UpdateRolePayload } from '../types/role.types'

export function useRoles(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.roles.list(query),
        queryFn: () => rolesService.getPaged(query),
    })
}

export function useCreateRole() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateRolePayload) => rolesService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
            notify.success('Rol creado', 'El rol se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear rol', getApiErrorMessage(error))
        },
    })
}

export function useUpdateRole() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateRolePayload }) =>
            rolesService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
            notify.success('Rol actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar rol', getApiErrorMessage(error))
        },
    })
}

export function useDeleteRole() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => rolesService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
            notify.success('Rol eliminado', 'El rol se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar rol', getApiErrorMessage(error))
        },
    })
}
