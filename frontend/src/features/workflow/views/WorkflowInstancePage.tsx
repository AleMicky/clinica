import { Link } from '@tanstack/react-router'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'

import { WorkflowEntityPanel } from '../components/WorkflowEntityPanel'

const { Text, Title } = Typography

type WorkflowInstancePageProps = {
    instanceId: string
}

export function WorkflowInstancePage({ instanceId }: WorkflowInstancePageProps) {
    return (
        <div className="workflow-module workflow-instance-page">
            <div className="workflow-module__header workflow-module__header--list">
                <Link to="/workflow">
                    <Button
                        type="link"
                        size="small"
                        icon={<ArrowLeftOutlined />}
                        className="workflow-module__back"
                    >
                        Volver al listado
                    </Button>
                </Link>
                <Title level={4} className="workflow-module__title">
                    Instancia de workflow
                </Title>
                <Text type="secondary" className="workflow-module__subtitle">
                    Ejecute transiciones y revise el historial del flujo.
                </Text>
            </div>

            <div className="workflow-instance-page__body">
                <WorkflowEntityPanel
                    instanceId={instanceId}
                    title="Estado y acciones"
                    showHistory
                    historyDefaultOpen
                    allowStart={false}
                    variant="card"
                />
            </div>
        </div>
    )
}
