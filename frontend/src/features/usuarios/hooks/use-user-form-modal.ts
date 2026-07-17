import { useCallback, useState } from 'react'

import {
    toCreateUsuarioPersonaPayload,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'
import type { UpdateUserFormValues } from '../schemas/user.schema'
import type { User } from '../types/user.types'
import { useCreateUserWithPersona, useUpdateUser } from './users.hooks'

export function useUserFormModal() {
    const createUserWithPersona = useCreateUserWithPersona()
    const updateUser = useUpdateUser()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const isSaving = createUserWithPersona.isPending || updateUser.isPending

    const openCreateModal = useCallback(() => {
        setEditingUser(null)
        setModalOpen(true)
    }, [])

    const openEditModal = useCallback((user: User) => {
        setEditingUser(user)
        setModalOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        if (isSaving) return
        setModalOpen(false)
        setEditingUser(null)
    }, [isSaving])

    const handleCreate = useCallback(
        async (values: CreateUsuarioPersonaFormValues) => {
            await createUserWithPersona.mutateAsync(toCreateUsuarioPersonaPayload(values))
            setModalOpen(false)
            setEditingUser(null)
        },
        [createUserWithPersona],
    )

    const handleUpdate = useCallback(
        async (values: UpdateUserFormValues) => {
            if (!editingUser) return

            await updateUser.mutateAsync({
                id: editingUser.id,
                data: {
                    nombreCompleto: values.nombreCompleto,
                    activo: values.activo,
                },
            })
            setModalOpen(false)
            setEditingUser(null)
        },
        [editingUser, updateUser],
    )

    return {
        modalOpen,
        editingUser,
        isSaving,
        openCreateModal,
        openEditModal,
        closeModal,
        handleCreate,
        handleUpdate,
    }
}
