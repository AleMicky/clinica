import { useCallback, useState } from 'react'

import type { User } from '../types/user.types'
import { useDeleteUser, useUpdateUser } from './users.hooks'

export function useUserActions() {
    const deleteUser = useDeleteUser()
    const updateUser = useUpdateUser()

    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const requestDelete = useCallback((user: User) => {
        setUserToDelete(user)
    }, [])

    const cancelDelete = useCallback(() => {
        if (deletingId) return
        setUserToDelete(null)
    }, [deletingId])

    const confirmDelete = useCallback(async () => {
        if (!userToDelete) return

        setDeletingId(userToDelete.id)

        try {
            await deleteUser.mutateAsync(userToDelete.id)
            setUserToDelete(null)
        } finally {
            setDeletingId(null)
        }
    }, [deleteUser, userToDelete])

    const toggleActive = useCallback(
        async (user: User) => {
            setTogglingId(user.id)

            try {
                await updateUser.mutateAsync({
                    id: user.id,
                    data: {
                        nombreCompleto: user.nombreCompleto,
                        activo: !user.activo,
                    },
                })
            } finally {
                setTogglingId(null)
            }
        },
        [updateUser],
    )

    return {
        deletingId,
        togglingId,
        userToDelete,
        requestDelete,
        cancelDelete,
        confirmDelete,
        toggleActive,
        isDeleting: Boolean(deletingId),
    }
}
