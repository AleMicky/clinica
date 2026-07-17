import { useEffect, useState } from 'react'

import type { CreateUsuarioPersonaFormValues } from '../schemas/usuario-persona.schema'
import type { UpdateUserFormValues } from '../schemas/user.schema'
import type { User } from '../types/user.types'
import { UserCreateDrawer } from './UserCreateDrawer'
import { UserEditDrawer } from './UserEditDrawer'

type UserFormModalProps = {
    open: boolean
    user: User | null
    roleOptions: string[]
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateUsuarioPersonaFormValues) => Promise<void>
    onUpdate: (values: UpdateUserFormValues) => Promise<void>
}

/** Punto de entrada del drawer de usuario (crear / editar). */
export function UserFormModal({
    open,
    user,
    roleOptions,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: UserFormModalProps) {
    const [mode, setMode] = useState<'create' | 'edit'>(user ? 'edit' : 'create')
    const [activeUser, setActiveUser] = useState<User | null>(user)

    useEffect(() => {
        if (!open) return

        setMode(user ? 'edit' : 'create')
        setActiveUser(user)
    }, [open, user])

    if (mode === 'edit' && activeUser) {
        return (
            <UserEditDrawer
                open={open}
                user={activeUser}
                roleOptions={roleOptions}
                loading={loading}
                onClose={onClose}
                onUpdate={onUpdate}
            />
        )
    }

    return (
        <UserCreateDrawer
            open={open}
            roleOptions={roleOptions}
            loading={loading}
            onClose={onClose}
            onCreate={onCreate}
        />
    )
}
