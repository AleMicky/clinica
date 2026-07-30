import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type MetodosPagoHeaderProps = {
    onCreate: () => void
}

export function MetodosPagoHeader({ onCreate }: MetodosPagoHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear método de pago"
            >
                Nuevo método
            </Button>
        </Flex>
    )
}
