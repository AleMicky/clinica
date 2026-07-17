import { Button, Empty, Flex, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { JerarquiaChildCard } from './JerarquiaChildCard'

const { Text } = Typography

export type ServicesCardItem = {
    id: string
    icon: React.ReactNode
    nombre: string
    codigo: string
    meta?: string | null
    selected?: boolean
    onClick: () => void
}

type ServicesCardProps = {
    title: string
    sectionIcon: React.ReactNode
    count: number
    items: ServicesCardItem[]
    emptyDescription: string
    emptyActionLabel: string
    onEmptyAction: () => void
}

export function ServicesCard({
    title,
    sectionIcon,
    count,
    items,
    emptyDescription,
    emptyActionLabel,
    onEmptyAction,
}: ServicesCardProps) {
    return (
        <div className="jerarquia-explorer__detail-section">
            <Flex
                align="center"
                justify="space-between"
                gap={8}
                className="jerarquia-explorer__section-head"
            >
                <Flex align="center" gap={6}>
                    <span className="jerarquia-explorer__section-icon-inline" aria-hidden>
                        {sectionIcon}
                    </span>
                    <Text strong className="jerarquia-explorer__section-title">
                        {title}
                    </Text>
                    <Text type="secondary" className="jerarquia-explorer__section-count">
                        {count}
                    </Text>
                </Flex>
            </Flex>
            {items.length === 0 ? (
                <div className="jerarquia-explorer__section-empty">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={onEmptyAction}
                        >
                            {emptyActionLabel}
                        </Button>
                    </Empty>
                </div>
            ) : (
                <div className="jerarquia-explorer__child-list">
                    {items.map((item) => (
                        <JerarquiaChildCard
                            key={item.id}
                            icon={item.icon}
                            nombre={item.nombre}
                            codigo={item.codigo}
                            meta={item.meta}
                            selected={item.selected}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
