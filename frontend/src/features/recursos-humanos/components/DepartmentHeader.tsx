import { Tag, Typography } from 'antd'

const { Paragraph, Text, Title } = Typography

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
    stats?: React.ReactNode
}

export function DepartmentHeader({
    icon,
    codigo,
    nombre,
    hierarchy,
    parentLabel,
    descripcion,
    stats,
}: DepartmentHeaderProps) {
    const hasHierarchy = hierarchy && hierarchy.length > 0

    return (
        <div className="jerarquia-explorer__detail-hero">
            <div className="jerarquia-explorer__detail-main">
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
                                <span
                                    key={`${item.label}-${item.nombre}`}
                                    className="jerarquia-explorer__hierarchy-item"
                                >
                                    {index > 0 ? (
                                        <span
                                            className="jerarquia-explorer__hierarchy-sep"
                                            aria-hidden
                                        >
                                            /
                                        </span>
                                    ) : null}
                                    <span
                                        className="jerarquia-explorer__hierarchy-name"
                                        title={`${item.label}: ${item.nombre}`}
                                    >
                                        {item.nombre}
                                    </span>
                                </span>
                            ))}
                        </nav>
                    ) : null}
                    <div className="jerarquia-explorer__detail-title-row">
                        <Title level={5} className="jerarquia-explorer__detail-title">
                            {nombre}
                        </Title>
                        <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                            {codigo}
                        </Tag>
                    </div>
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
            </div>
            {stats}
        </div>
    )
}
