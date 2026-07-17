import { Button, Flex, Tag, Typography } from 'antd'

const { Paragraph, Text, Title } = Typography

type DepartmentHeaderAction = {
    label: string
    icon: React.ReactNode
    onClick: () => void
    primary?: boolean
}

type DepartmentHeaderProps = {
    icon: React.ReactNode
    codigo: string
    nombre: string
    parentLabel?: string | null
    descripcion?: string | null
    actions: DepartmentHeaderAction[]
    stats?: React.ReactNode
}

export function DepartmentHeader({
    icon,
    codigo,
    nombre,
    parentLabel,
    descripcion,
    actions,
    stats,
}: DepartmentHeaderProps) {
    return (
        <div className="jerarquia-explorer__detail-hero">
            <Flex align="flex-start" justify="space-between" gap={12} wrap="wrap">
                <Flex align="flex-start" gap={10} className="jerarquia-explorer__detail-main">
                    <div className="jerarquia-explorer__detail-badge" aria-hidden>
                        {icon}
                    </div>
                    <div className="jerarquia-explorer__detail-copy">
                        <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                            {codigo}
                        </Tag>
                        <Title level={4} className="jerarquia-explorer__detail-title">
                            {nombre}
                        </Title>
                        {parentLabel ? (
                            <Text type="secondary" className="jerarquia-explorer__detail-parent">
                                {parentLabel}
                            </Text>
                        ) : null}
                        {descripcion ? (
                            <Paragraph
                                type="secondary"
                                className="jerarquia-explorer__detail-description"
                            >
                                {descripcion}
                            </Paragraph>
                        ) : null}
                    </div>
                </Flex>
                <Flex gap={8} wrap="wrap" className="jerarquia-explorer__detail-actions">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
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
