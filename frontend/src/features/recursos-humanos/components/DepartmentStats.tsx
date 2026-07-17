import { Typography } from 'antd'

const { Text } = Typography

export type DepartmentStatItem = {
    label: string
    value: string | number
}

type DepartmentStatsProps = {
    items: DepartmentStatItem[]
}

export function DepartmentStats({ items }: DepartmentStatsProps) {
    if (items.length === 0) return null

    return (
        <div className="jerarquia-explorer__stats-row">
            {items.map((item) => (
                <div key={item.label} className="jerarquia-explorer__stat">
                    <Text type="secondary" className="jerarquia-explorer__stat-label">
                        {item.label}
                    </Text>
                    <Text strong className="jerarquia-explorer__stat-value">
                        {item.value}
                    </Text>
                </div>
            ))}
        </div>
    )
}
