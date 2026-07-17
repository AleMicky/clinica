import { Button, Dropdown, Tag, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

const { Text } = Typography

type JerarquiaTreeNodeTitleProps = {
    icon: React.ReactNode
    nombre: string
    codigo: string
    countLabel?: string
    menuItems: MenuProps['items']
    deleting?: boolean
}

export function JerarquiaTreeNodeTitle({
    icon,
    nombre,
    codigo,
    countLabel,
    menuItems,
    deleting,
}: JerarquiaTreeNodeTitleProps) {
    return (
        <div className="jerarquia-explorer__tree-node" title={countLabel ? `${nombre} · ${countLabel}` : nombre}>
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
                        aria-label="Acciones"
                    />
                </Dropdown>
            </span>
        </div>
    )
}
