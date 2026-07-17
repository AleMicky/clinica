import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type EmpleadosHeaderProps = {
    onCreate: () => void
}

export function EmpleadosHeader({ onCreate }: EmpleadosHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear nuevo empleado"
            >
                Nuevo empleado
            </Button>
        </Flex>
    )
}
