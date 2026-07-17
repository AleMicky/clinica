import { Tag, Typography } from 'antd'
import { RightOutlined } from '@ant-design/icons'

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
                'jerarquia-explorer__child-row',
                selected ? 'jerarquia-explorer__child-row--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            <span className="jerarquia-explorer__child-row-icon" aria-hidden>
                {icon}
            </span>
            <span className="jerarquia-explorer__child-row-body">
                <Text strong className="jerarquia-explorer__child-row-name">
                    {nombre}
                </Text>
                {meta ? (
                    <Text type="secondary" className="jerarquia-explorer__child-row-meta">
                        {meta}
                    </Text>
                ) : null}
            </span>
            <Tag className="jerarquia-explorer__child-row-code" variant="filled">
                {codigo}
            </Tag>
            <RightOutlined className="jerarquia-explorer__child-row-chevron" aria-hidden />
        </button>
    )
}
