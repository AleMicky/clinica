import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type UnidadesMedidaHeaderProps = {
    onCreate: () => void
}

export function UnidadesMedidaHeader({ onCreate }: UnidadesMedidaHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear nueva unidad de medida"
            >
                Nueva unidad
            </Button>
        </Flex>
    )
}
