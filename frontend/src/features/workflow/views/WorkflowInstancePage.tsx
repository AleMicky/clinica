import { Typography } from 'antd'

import { WorkflowEntityPanel } from '../components/WorkflowEntityPanel'

const { Text, Title } = Typography

type WorkflowInstancePageProps = {
    instanceId: string
}

export function WorkflowInstancePage({ instanceId }: WorkflowInstancePageProps) {
    return (
        <div className="workflow-module workflow-instance-page">
            <div className="workflow-module__header workflow-module__header--list">
                <Title level={4} className="workflow-module__title">
                    Instancia de workflow
                </Title>
                <Text type="secondary" className="workflow-module__subtitle">
                    Ejecute transiciones y revise el historial del flujo.
                </Text>
            </div>

            <WorkflowEntityPanel
                instanceId={instanceId}
                title="Estado y acciones"
                showHistory
                allowStart={false}
                variant="card"
            />
        </div>
    )
}
