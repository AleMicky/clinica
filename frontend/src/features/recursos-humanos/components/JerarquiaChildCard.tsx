import { Typography } from 'antd'

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
                <Text strong className="jerarquia-explorer__child-card-name">
                    {nombre}
                </Text>
                <Text type="secondary" className="jerarquia-explorer__child-card-code">
                    {codigo}
                </Text>
                {meta ? (
                    <Text type="secondary" className="jerarquia-explorer__child-card-meta">
                        {meta}
                    </Text>
                ) : null}
            </span>
        </button>
    )
}
