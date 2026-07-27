import { PlayCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Typography } from 'antd'

const { Text, Title } = Typography

type WorkflowStartPanelProps = {
    definitionCode?: string
    definitionName?: string
    loading?: boolean
    disabled?: boolean
    onStart: () => Promise<void>
}

export function WorkflowStartPanel({
    definitionCode,
    definitionName,
    loading = false,
    disabled = false,
    onStart,
}: WorkflowStartPanelProps) {
    if (!definitionCode) {
        return (
            <Alert
                type="info"
                showIcon
                message="Sin workflow iniciado"
                description="Esta entidad aún no tiene una instancia de workflow. Configure definitionCode en el panel para poder iniciarlo."
            />
        )
    }

    return (
        <div className="workflow-start-panel">
            <Flex vertical gap={8}>
                <Title level={5} style={{ margin: 0 }}>
                    Iniciar workflow
                </Title>
                <Text type="secondary">
                    No hay una instancia activa. Puede iniciar el flujo{' '}
                    <Text strong>{definitionName ?? definitionCode}</Text>.
                </Text>
                <div>
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        loading={loading}
                        disabled={disabled}
                        onClick={() => void onStart()}
                    >
                        Iniciar workflow
                    </Button>
                </div>
            </Flex>
        </div>
    )
}
