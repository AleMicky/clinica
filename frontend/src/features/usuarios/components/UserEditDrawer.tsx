import { Button, Drawer, Flex, Grid } from 'antd'

import { useUserEditForm } from '../hooks/use-user-edit-form'
import type { UpdateUserFormValues } from '../schemas/user.schema'
import type { User } from '../types/user.types'
import { UserEditFields } from './UserEditFields'

const { useBreakpoint } = Grid

type UserEditDrawerProps = {
    open: boolean
    user: User
    roleOptions: string[]
    loading: boolean
    onClose: () => void
    onUpdate: (values: UpdateUserFormValues) => Promise<void>
}

export function UserEditDrawer({
    open,
    user,
    roleOptions,
    loading,
    onClose,
    onUpdate,
}: UserEditDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 720 : '95%'

    const {
        form,
        selectedRoles,
        rolesError,
        isSaving,
        setSelectedRoles,
        handleSubmit,
    } = useUserEditForm({ open, user, loading, onUpdate })

    const handleClose = () => {
        if (isSaving) return
        onClose()
    }

    return (
        <Drawer
            title="Editar usuario"
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button type="primary" loading={isSaving} onClick={handleSubmit}>
                        Guardar
                    </Button>
                </Flex>
            }
        >
            <UserEditFields
                form={form}
                user={user}
                roleOptions={roleOptions}
                selectedRoles={selectedRoles}
                rolesError={rolesError}
                loading={isSaving}
                onRolesChange={setSelectedRoles}
            />
        </Drawer>
    )
}
