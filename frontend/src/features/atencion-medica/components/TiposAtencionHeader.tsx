import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type TiposAtencionHeaderProps = {
    onCreate: () => void
}

export function TiposAtencionHeader({ onCreate }: TiposAtencionHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                aria-label="Crear nuevo tipo de atención"
            >
                Nuevo tipo de atención
            </Button>
        </Flex>
    )
}
