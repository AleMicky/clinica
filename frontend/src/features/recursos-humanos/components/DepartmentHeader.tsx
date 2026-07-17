import { Button, Flex, Tag, Typography } from 'antd'

const { Paragraph, Text, Title } = Typography

type DepartmentHeaderAction = {
    label: string
    icon: React.ReactNode
    onClick: () => void
    primary?: boolean
}

export type HierarchyPathItem = {
    label: string
    nombre: string
}

type DepartmentHeaderProps = {
    icon: React.ReactNode
    codigo: string
    nombre: string
    hierarchy?: HierarchyPathItem[]
    parentLabel?: string | null
    descripcion?: string | null
    actions: DepartmentHeaderAction[]
    stats?: React.ReactNode
}

export function DepartmentHeader({
    icon,
    codigo,
    nombre,
    hierarchy,
    parentLabel,
    descripcion,
    actions,
    stats,
}: DepartmentHeaderProps) {
    const hasHierarchy = hierarchy && hierarchy.length > 0

    return (
        <div className="jerarquia-explorer__detail-hero">
            <Flex align="flex-start" justify="space-between" gap={10} wrap="wrap">
                <Flex align="flex-start" gap={8} className="jerarquia-explorer__detail-main">
                    <div className="jerarquia-explorer__detail-badge" aria-hidden>
                        {icon}
                    </div>
                    <div className="jerarquia-explorer__detail-copy">
                        {hasHierarchy ? (
                            <nav
                                className="jerarquia-explorer__hierarchy-path"
                                aria-label="Jerarquía organizacional"
                            >
                                {hierarchy.map((item, index) => (
                                    <span key={`${item.label}-${item.nombre}`} className="jerarquia-explorer__hierarchy-item">
                                        {index > 0 ? (
                                            <span className="jerarquia-explorer__hierarchy-sep" aria-hidden>
                                                ›
                                            </span>
                                        ) : null}
                                        <span className="jerarquia-explorer__hierarchy-label">
                                            {item.label}
                                        </span>
                                        <span className="jerarquia-explorer__hierarchy-name">
                                            {item.nombre}
                                        </span>
                                    </span>
                                ))}
                            </nav>
                        ) : null}
                        <Flex align="center" gap={6} wrap="wrap" className="jerarquia-explorer__detail-title-row">
                            <Title level={4} className="jerarquia-explorer__detail-title">
                                {nombre}
                            </Title>
                            <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                                {codigo}
                            </Tag>
                        </Flex>
                        {!hasHierarchy && parentLabel ? (
                            <Text type="secondary" className="jerarquia-explorer__detail-parent">
                                {parentLabel}
                            </Text>
                        ) : null}
                        {descripcion ? (
                            <Paragraph
                                type="secondary"
                                className="jerarquia-explorer__detail-description"
                                ellipsis={{ rows: 2 }}
                            >
                                {descripcion}
                            </Paragraph>
                        ) : null}
                    </div>
                </Flex>
                <Flex gap={6} wrap="wrap" className="jerarquia-explorer__detail-actions">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            size="small"
                            type={action.primary ? 'primary' : 'default'}
                            icon={action.icon}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    ))}
                </Flex>
            </Flex>
            {stats}
        </div>
    )
}
