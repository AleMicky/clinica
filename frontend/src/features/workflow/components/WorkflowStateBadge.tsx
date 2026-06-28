import { Tag } from 'antd'

type WorkflowStateBadgeProps = {
    name: string
    color?: string
    code?: string
}

export function WorkflowStateBadge({ name, color = '#1677ff', code }: WorkflowStateBadgeProps) {
    return (
        <Tag
            color={color}
            className="workflow-state-badge"
            title={code}
        >
            {name}
        </Tag>
    )
}
