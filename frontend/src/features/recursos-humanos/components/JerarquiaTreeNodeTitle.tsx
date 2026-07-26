import { Button, Dropdown, Tag, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { EditOutlined, MoreOutlined } from '@ant-design/icons'

const { Text } = Typography

type JerarquiaTreeNodeTitleProps = {
    icon: React.ReactNode
    nombre: string
    codigo: string
    countLabel?: string
    menuItems: MenuProps['items']
    deleting?: boolean
    onEdit: () => void
}

export function JerarquiaTreeNodeTitle({
    icon,
    nombre,
    codigo,
    countLabel,
    menuItems,
    deleting,
    onEdit,
}: JerarquiaTreeNodeTitleProps) {
    return (
        <div
            className="jerarquia-explorer__tree-node jerarquia-explorer__tree-node--area"
            title={countLabel ? `${nombre} · ${countLabel}` : nombre}
        >
            <span className="jerarquia-explorer__tree-node-icon" aria-hidden>
                {icon}
            </span>
            <Text className="jerarquia-explorer__tree-node-name" ellipsis>
                {nombre}
            </Text>
            <Tag className="jerarquia-explorer__tree-node-tag" variant="filled">
                {codigo}
            </Tag>
            <span className="jerarquia-explorer__tree-node-actions">
                <Tooltip title="Editar">
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(event) => {
                            event.stopPropagation()
                            onEdit()
                        }}
                        aria-label="Editar"
                    />
                </Tooltip>
                <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        loading={deleting}
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Más acciones"
                    />
                </Dropdown>
            </span>
        </div>
    )
}
