import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'

import {
    updateUserDefaultValues,
    updateUserSchema,
    type UpdateUserFormValues,
} from '../schemas/user.schema'
import type { User } from '../types/user.types'
import { useSyncUserRoles } from './users.hooks'

type UseUserEditFormOptions = {
    open: boolean
    user: User
    loading: boolean
    onUpdate: (values: UpdateUserFormValues) => Promise<void>
}

export function useUserEditForm({
    open,
    user,
    loading,
    onUpdate,
}: UseUserEditFormOptions) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [rolesError, setRolesError] = useState<string | null>(null)

    const syncUserRoles = useSyncUserRoles()
    const isSaving = loading || syncUserRoles.isPending

    const form = useForm({
        defaultValues: updateUserDefaultValues,
        validators: {
            onSubmit: updateUserSchema,
        },
        onSubmit: async ({ value }) => {
            if (selectedRoles.length === 0) {
                setRolesError('Asigne al menos un rol.')
                return
            }

            setRolesError(null)

            const rolesChanged =
                selectedRoles.length !== user.roles.length ||
                selectedRoles.some((role) => !user.roles.includes(role))

            if (rolesChanged) {
                await syncUserRoles.mutateAsync({
                    userId: user.id,
                    currentRoles: user.roles,
                    nextRoles: selectedRoles,
                })
            }

            await onUpdate(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()
        form.setFieldValue('nombreCompleto', user.nombreCompleto)
        form.setFieldValue('activo', user.activo)
        setSelectedRoles(user.roles)
        setRolesError(null)
    }, [open, user, form])

    return {
        form,
        selectedRoles,
        rolesError,
        isSaving,
        setSelectedRoles: (value: string[]) => {
            setSelectedRoles(value)
            if (value.length > 0) {
                setRolesError(null)
            }
        },
        handleSubmit: () => void form.handleSubmit(),
    }
}
