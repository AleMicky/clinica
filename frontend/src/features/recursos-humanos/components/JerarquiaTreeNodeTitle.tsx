import { Button, Dropdown, Tag, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

export type TreeNodeLevel = 'area' | 'departamento' | 'servicio'

type JerarquiaTreeNodeTitleProps = {
    icon: React.ReactNode
    nombre: string
    codigo: string
    level?: TreeNodeLevel
    countLabel?: string
    menuItems: MenuProps['items']
    deleting?: boolean
    onEdit: () => void
    onCreate?: () => void
    createLabel?: string
}

export function JerarquiaTreeNodeTitle({
    icon,
    nombre,
    codigo,
    level = 'area',
    countLabel,
    menuItems,
    deleting,
    onEdit,
    onCreate,
    createLabel,
}: JerarquiaTreeNodeTitleProps) {
    return (
        <div
            className={`jerarquia-explorer__tree-node jerarquia-explorer__tree-node--${level}`}
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
                {onCreate ? (
                    <Tooltip title={createLabel ?? 'Nuevo'}>
                        <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(event) => {
                                event.stopPropagation()
                                onCreate()
                            }}
                            aria-label={createLabel ?? 'Nuevo'}
                        />
                    </Tooltip>
                ) : null}
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
