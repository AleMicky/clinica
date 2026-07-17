import { memo } from 'react'
import { Tag } from 'antd'

type UserStatusBadgeProps = {
    activo: boolean
}

export const UserStatusBadge = memo(function UserStatusBadge({ activo }: UserStatusBadgeProps) {
    return (
        <Tag
            className={
                activo
                    ? 'seguridad-status-tag seguridad-status-tag--active'
                    : 'seguridad-status-tag seguridad-status-tag--inactive'
            }
        >
            <span className="seguridad-status-tag__dot" aria-hidden />
            {activo ? 'Activo' : 'Inactivo'}
        </Tag>
    )
})
