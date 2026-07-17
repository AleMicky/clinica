import { memo } from 'react'
import { Button, Dropdown, Flex, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons'

type UsersHeaderProps = {
    onCreate: () => void
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

export const UsersHeader = memo(function UsersHeader({ onCreate }: UsersHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="seguridad-section-panel__actions">
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
    )
})
