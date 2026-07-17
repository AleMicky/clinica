import { memo } from 'react'
import { Button, Dropdown, Flex, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { EllipsisOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'

const { Text } = Typography

type UsersHeaderProps = {
    onCreate: () => void
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

export const UsersHeader = memo(function UsersHeader({ onCreate, caption }: UsersHeaderProps) {
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
            <Flex gap={8} wrap="wrap" align="center" className="seguridad-section-panel__actions">
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
})
