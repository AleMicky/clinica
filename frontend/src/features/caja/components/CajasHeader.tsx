import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type CajasHeaderProps = {
    onCreate: () => void
}

export function CajasHeader({ onCreate }: CajasHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear caja"
            >
                Nueva caja
            </Button>
        </Flex>
    )
}
