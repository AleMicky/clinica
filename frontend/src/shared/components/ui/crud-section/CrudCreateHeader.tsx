import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export type CrudCreateHeaderProps = {
    label: string
    ariaLabel: string
    onCreate: () => void
}

export function CrudCreateHeader({
    label,
    ariaLabel,
    onCreate,
}: CrudCreateHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label={ariaLabel}
            >
                {label}
            </Button>
        </Flex>
    )
}
