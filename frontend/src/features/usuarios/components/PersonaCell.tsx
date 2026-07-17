import { memo } from 'react'
import { Flex, Tooltip, Typography } from 'antd'
import { MailOutlined } from '@ant-design/icons'

import type { User } from '../types/user.types'
import { formatPersonaDocumento } from '../utils/user-display'

type PersonaCellProps = {
    user: User
}

export const PersonaCell = memo(function PersonaCell({ user }: PersonaCellProps) {
    if (!user.personaId) {
        return (
            <Typography.Text type="secondary" className="seguridad-user-cell__persona-empty">
                Sin persona
            </Typography.Text>
        )
    }

    const documento = formatPersonaDocumento(user)
    const telefono = user.personaTelefono?.trim() || null
    const nombre = user.personaNombreCompleto ?? user.nombreCompleto
    const meta = [documento, telefono].filter(Boolean).join(' · ')

    return (
        <div className="seguridad-user-cell__persona">
            <Typography.Text className="seguridad-user-cell__persona-name">
                {nombre}
            </Typography.Text>
            {meta ? (
                <Tooltip title={meta}>
                    <Typography.Text
                        type="secondary"
                        className="seguridad-user-cell__persona-doc"
                    >
                        {meta}
                    </Typography.Text>
                </Tooltip>
            ) : null}
        </div>
    )
})

type UserContactMetaProps = {
    email?: string | null
}

export const UserEmailMeta = memo(function UserEmailMeta({ email }: UserContactMetaProps) {
    const value = email?.trim()
    if (!value) return null

    return (
        <Flex align="center" gap={6} className="seguridad-user-cell__persona-row">
            <MailOutlined className="seguridad-user-cell__meta-icon" aria-hidden />
            <Tooltip title={value}>
                <Typography.Text type="secondary" className="seguridad-user-cell__username">
                    {value}
                </Typography.Text>
            </Tooltip>
        </Flex>
    )
})
