import { memo, useMemo } from 'react'
import { Button, Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    KeyOutlined,
    LockOutlined,
    MoreOutlined,
    UnlockOutlined,
} from '@ant-design/icons'

import type { User } from '../types/user.types'

type UserActionsDropdownProps = {
    user: User
    busy?: boolean
    onEdit: (user: User) => void
    onToggleActive: (user: User) => void
    onDelete: (user: User) => void
    onResetPassword?: (user: User) => void
}

export const UserActionsDropdown = memo(function UserActionsDropdown({
    user,
    busy = false,
    onEdit,
    onToggleActive,
    onDelete,
    onResetPassword,
}: UserActionsDropdownProps) {
    const menuItems: MenuProps['items'] = useMemo(
        () => [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Editar',
                onClick: () => onEdit(user),
            },
            {
                key: 'reset-password',
                icon: <KeyOutlined />,
                label: (
                    <Tooltip title="Próximamente" placement="left">
                        <span>Restablecer contraseña</span>
                    </Tooltip>
                ),
                disabled: true,
                onClick: onResetPassword ? () => onResetPassword(user) : undefined,
            },
            {
                key: 'toggle',
                icon: user.activo ? <LockOutlined /> : <UnlockOutlined />,
                label: user.activo ? 'Bloquear' : 'Activar',
                disabled: busy,
                onClick: () => onToggleActive(user),
            },
            { type: 'divider' },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Eliminar',
                danger: true,
                disabled: !user.activo || busy,
                onClick: () => onDelete(user),
            },
        ],
        [busy, onDelete, onEdit, onResetPassword, onToggleActive, user],
    )

    return (
        <div className="seguridad-user-actions">
            <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
            >
                <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    loading={busy}
                    aria-label={`Acciones para ${user.userName}`}
                    className="seguridad-user-actions__trigger"
                />
            </Dropdown>
        </div>
    )
})
