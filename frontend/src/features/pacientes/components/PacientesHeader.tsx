import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type PacientesHeaderProps = {
    onCreate: () => void
}

export function PacientesHeader({ onCreate }: PacientesHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear nuevo paciente"
            >
                Nuevo paciente
            </Button>
        </Flex>
    )
}
