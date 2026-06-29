import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { usersService } from '../services/users.service'
import type { CreateUserPayload, CreateUsuarioPersonaApiPayload, UpdateUserPayload } from '../types/user.types'

function getRoleChanges(currentRoles: string[], nextRoles: string[]) {
    const current = new Set(currentRoles)
    const next = new Set(nextRoles)

    return {
        toAdd: nextRoles.filter((role) => !current.has(role)),
        toRemove: currentRoles.filter((role) => !next.has(role)),
    }
}

export async function syncUserRoles(
    userId: string,
    currentRoles: string[],
    nextRoles: string[],
) {
    const { toAdd, toRemove } = getRoleChanges(currentRoles, nextRoles)

    await Promise.all([
        ...toAdd.map((role) => usersService.assignRole(userId, role)),
        ...toRemove.map((role) => usersService.removeRole(userId, role)),
    ])
}

export function useSyncUserRoles() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            userId,
            currentRoles,
            nextRoles,
        }: {
            userId: string
            currentRoles: string[]
            nextRoles: string[]
        }) => syncUserRoles(userId, currentRoles, nextRoles),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
        },
        onError: (error) => {
            notify.error('Error al actualizar roles', getApiErrorMessage(error))
        },
    })
}

export function useUsers(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.users.list(query),
        queryFn: () => usersService.getPaged(query),
    })
}

export function useCreateUserWithPersona() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateUsuarioPersonaApiPayload) =>
            usersService.createWithPersona(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.personas.all })
            notify.success('Usuario creado', 'El usuario y la persona se registraron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear usuario', getApiErrorMessage(error))
        },
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
