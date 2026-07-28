import { Tag } from 'antd'

type StatusBadgeProps = {
    active: boolean
    activeLabel?: string
    inactiveLabel?: string
    className?: string
}

export function StatusBadge({
    active,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    className,
}: StatusBadgeProps) {
    return (
        <Tag
            className={[
                'status-badge',
                active ? 'status-badge--active' : 'status-badge--inactive',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <span className="status-badge__dot" aria-hidden />
            {active ? activeLabel : inactiveLabel}
        </Tag>
    )
}
