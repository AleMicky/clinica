import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type MedicosHeaderProps = {
    onCreate: () => void
}

export function MedicosHeader({ onCreate }: MedicosHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear nuevo médico"
            >
                Nuevo médico
            </Button>
        </Flex>
    )
}
