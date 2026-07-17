import { memo } from 'react'
import { Flex, Tooltip, Typography } from 'antd'
import {
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from '@ant-design/icons'

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

    return (
        <div className="seguridad-user-cell__persona">
            <Flex align="center" gap={6} className="seguridad-user-cell__persona-row">
                <UserOutlined className="seguridad-user-cell__meta-icon" aria-hidden />
                <Typography.Text className="seguridad-user-cell__persona-name">
                    {user.personaNombreCompleto ?? user.nombreCompleto}
                </Typography.Text>
            </Flex>

            {documento ? (
                <Flex align="center" gap={6} className="seguridad-user-cell__persona-row">
                    <IdcardOutlined className="seguridad-user-cell__meta-icon" aria-hidden />
                    <Tooltip title={documento}>
                        <Typography.Text
                            type="secondary"
                            className="seguridad-user-cell__persona-doc"
                        >
                            {documento}
                        </Typography.Text>
                    </Tooltip>
                </Flex>
            ) : null}

            {telefono ? (
                <Flex align="center" gap={6} className="seguridad-user-cell__persona-row">
                    <PhoneOutlined className="seguridad-user-cell__meta-icon" aria-hidden />
                    <Typography.Text
                        type="secondary"
                        className="seguridad-user-cell__persona-doc"
                    >
                        {telefono}
                    </Typography.Text>
                </Flex>
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
