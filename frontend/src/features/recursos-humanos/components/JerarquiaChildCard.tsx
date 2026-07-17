import { Tag, Typography } from 'antd'

const { Text } = Typography

type JerarquiaChildCardProps = {
    icon: React.ReactNode
    nombre: string
    codigo: string
    meta?: string | null
    selected?: boolean
    onClick: () => void
}

export function JerarquiaChildCard({
    icon,
    nombre,
    codigo,
    meta,
    selected,
    onClick,
}: JerarquiaChildCardProps) {
    return (
        <button
            type="button"
            className={[
                'jerarquia-explorer__child-card',
                selected ? 'jerarquia-explorer__child-card--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            <span className="jerarquia-explorer__child-card-icon" aria-hidden>
                {icon}
            </span>
            <span className="jerarquia-explorer__child-card-body">
                <span className="jerarquia-explorer__child-card-top">
                    <Text strong className="jerarquia-explorer__child-card-name">
                        {nombre}
                    </Text>
                    <Tag className="jerarquia-explorer__child-card-code" variant="filled">
                        {codigo}
                    </Tag>
                </span>
                {meta ? (
                    <Text type="secondary" className="jerarquia-explorer__child-card-meta">
                        {meta}
                    </Text>
                ) : null}
            </span>
        </button>
    )
}
