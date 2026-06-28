import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { usersService } from '../services/users.service'
import type { CreateUserPayload, UpdateUserPayload } from '../types/user.types'

export function useUsers(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.users.list(query),
        queryFn: () => usersService.getPaged(query),
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateUserPayload) => usersService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
            notify.success('Usuario creado', 'El usuario se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear usuario', getApiErrorMessage(error))
        },
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
            usersService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
            notify.success('Usuario actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar usuario', getApiErrorMessage(error))
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => usersService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
            notify.success('Usuario desactivado', 'El usuario se desactivó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al desactivar usuario', getApiErrorMessage(error))
        },
    })
}
