import { memo } from 'react'
import { Tag, Tooltip, Typography } from 'antd'

type UserRoleTagProps = {
    role: string
}

export const UserRoleTag = memo(function UserRoleTag({ role }: UserRoleTagProps) {
    return (
        <Tooltip title={role}>
            <Tag className="seguridad-role-tag">{role}</Tag>
        </Tooltip>
    )
})

type UserRolesCellProps = {
    roles: string[]
}

export const UserRolesCell = memo(function UserRolesCell({ roles }: UserRolesCellProps) {
    if (roles.length === 0) {
        return <Typography.Text type="secondary">—</Typography.Text>
    }

    return (
        <div className="seguridad-user-cell__roles">
            {roles.map((role) => (
                <UserRoleTag key={role} role={role} />
            ))}
        </div>
    )
})
