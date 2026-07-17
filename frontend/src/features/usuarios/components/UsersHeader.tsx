import { memo } from 'react'
import { Button, Dropdown, Flex, Grid, Statistic, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
    EllipsisOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

type UsersHeaderProps = {
    totalUsers: number
    totalRoles: number
    loading?: boolean
    onCreate: () => void
    embedded?: boolean
    caption?: React.ReactNode
}

const futureActions: MenuProps['items'] = [
    {
        key: 'export',
        label: 'Exportar usuarios',
        disabled: true,
    },
    {
        key: 'invite',
        label: 'Invitar por correo',
        disabled: true,
    },
]

export const UsersHeader = memo(function UsersHeader({
    totalUsers,
    totalRoles,
    loading = false,
    onCreate,
    embedded = false,
    caption,
}: UsersHeaderProps) {
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    if (embedded) {
        return (
            <div className="seguridad-section-panel__head">
                <div className="seguridad-section-panel__head-text">
                    <Flex align="center" gap={10}>
                        <span className="seguridad-usuarios__header-icon" aria-hidden>
                            <UserOutlined />
                        </span>
                        <div>
                            <Text strong className="seguridad-section-panel__title">
                                Cuentas de usuario
                            </Text>
                            <Text type="secondary" className="seguridad-section-panel__caption">
                                {caption}
                            </Text>
                        </div>
                    </Flex>
                </div>
                <Flex
                    gap={8}
                    wrap="wrap"
                    align="center"
                    className="seguridad-section-panel__actions"
                >
                    <Tooltip title="Más acciones (próximamente)">
                        <Dropdown menu={{ items: futureActions }} trigger={['click']}>
                            <Button
                                type="text"
                                size="small"
                                icon={<EllipsisOutlined />}
                                aria-label="Acciones futuras"
                            />
                        </Dropdown>
                    </Tooltip>
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onCreate}
                        aria-label="Crear nuevo usuario"
                    >
                        Nuevo usuario
                    </Button>
                </Flex>
            </div>
        )
    }

    return (
        <header className="admin-page__header seguridad-usuarios__page-header">
            <Flex
                justify="space-between"
                align={isStacked ? 'flex-start' : 'center'}
                gap={16}
                wrap="wrap"
            >
                <Flex align="center" gap={16} className="seguridad-usuarios__page-header-main">
                    <div className="admin-page__header-icon" aria-hidden>
                        <UserOutlined />
                    </div>
                    <div>
                        <Title level={3} className="admin-page__title">
                            Usuarios
                        </Title>
                        <Text type="secondary">
                            Administre las cuentas de acceso al sistema hospitalario.
                        </Text>
                    </div>
                </Flex>

                <Flex gap={12} wrap="wrap" align="center" className="admin-page__header-stats">
                    <div className="admin-page__stat">
                        <Statistic
                            title="Usuarios"
                            value={totalUsers}
                            prefix={<TeamOutlined />}
                            loading={loading}
                        />
                    </div>
                    <div className="admin-page__stat">
                        <Statistic
                            title="Roles"
                            value={totalRoles}
                            prefix={<SafetyCertificateOutlined />}
                            loading={loading}
                        />
                    </div>
                    <Tooltip title="Más acciones (próximamente)">
                        <Dropdown menu={{ items: futureActions }} trigger={['click']}>
                            <Button
                                icon={<EllipsisOutlined />}
                                aria-label="Acciones futuras"
                            />
                        </Dropdown>
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onCreate}
                        aria-label="Crear nuevo usuario"
                    >
                        Nuevo usuario
                    </Button>
                </Flex>
            </Flex>
        </header>
    )
})
