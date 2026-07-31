import { Button, Flex } from 'antd'
import { UnlockOutlined } from '@ant-design/icons'

type TurnosHeaderProps = {
    onAbrir: () => void
}

export function TurnosHeader({ onAbrir }: TurnosHeaderProps) {
    return (
        <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
            <Button
                type="primary"
                size="small"
                icon={<UnlockOutlined />}
                onClick={onAbrir}
                aria-label="Abrir turno de caja"
            >
                Abrir turno
            </Button>
        </Flex>
    )
}
