import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Descriptions, Empty, Flex, Tag, Typography } from 'antd'

import { getBpmnKind } from '../../utils/buildWorkflowFlow'
import type { WorkflowState, WorkflowTransition } from '../../types/workflow.types'

const { Text, Title } = Typography

type BpmnPropertiesPanelProps = {
    state: WorkflowState | null
    transition: WorkflowTransition | null
    onEditState?: (state: WorkflowState) => void
    onDeleteState?: (state: WorkflowState) => void
    onEditTransition?: (transition: WorkflowTransition) => void
    onDeleteTransition?: (transition: WorkflowTransition) => void
    deleting?: boolean
}

function bpmnTypeLabel(state: WorkflowState): string {
    const kind = getBpmnKind(state)
    if (kind === 'start') return 'Evento de inicio'
    if (kind === 'end') return 'Evento de fin'
    if (kind === 'gateway') return 'Gateway XOR'
    return 'Tarea / Estado'
}

export function BpmnPropertiesPanel({
    state,
    transition,
    onEditState,
    onDeleteState,
    onEditTransition,
    onDeleteTransition,
    deleting = false,
}: BpmnPropertiesPanelProps) {
    if (!state && !transition) {
        return (
            <aside className="bpmn-properties">
                <Title level={5} className="bpmn-properties__title">
                    Propiedades
                </Title>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Seleccione un elemento o flujo en el diagrama."
                />
            </aside>
        )
    }

    if (state) {
        return (
            <aside className="bpmn-properties">
                <Title level={5} className="bpmn-properties__title">
                    Propiedades
                </Title>
                <Text type="secondary" className="bpmn-properties__subtitle">
                    {bpmnTypeLabel(state)}
                </Text>
                <Descriptions
                    size="small"
                    column={1}
                    className="bpmn-properties__descriptions"
                    items={[
                        { key: 'name', label: 'Nombre', children: state.name },
                        { key: 'code', label: 'Código', children: state.code },
                        {
                            key: 'flags',
                            label: 'Flags',
                            children: (
                                <Flex gap={4} wrap>
                                    {state.isInitial ? <Tag color="blue">Inicial</Tag> : null}
                                    {state.isFinal ? <Tag color="green">Final</Tag> : null}
                                    {state.isGateway ? <Tag color="gold">Gateway</Tag> : null}
                                    {!state.isInitial && !state.isFinal && !state.isGateway ? (
                                        <Tag>Normal</Tag>
                                    ) : null}
                                </Flex>
                            ),
                        },
                        { key: 'order', label: 'Orden', children: state.order },
                    ]}
                />
                <Flex gap={8} className="bpmn-properties__actions">
                    {onEditState ? (
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEditState(state)}
                        >
                            Editar
                        </Button>
                    ) : null}
                    {onDeleteState ? (
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={deleting}
                            onClick={() => onDeleteState(state)}
                        >
                            Eliminar
                        </Button>
                    ) : null}
                </Flex>
            </aside>
        )
    }

    return (
        <aside className="bpmn-properties">
            <Title level={5} className="bpmn-properties__title">
                Propiedades
            </Title>
            <Text type="secondary" className="bpmn-properties__subtitle">
                Flujo de secuencia
            </Text>
            <Descriptions
                size="small"
                column={1}
                className="bpmn-properties__descriptions"
                items={[
                    { key: 'name', label: 'Nombre', children: transition!.name },
                    { key: 'code', label: 'Código', children: transition!.code },
                    {
                        key: 'from',
                        label: 'Origen',
                        children: transition!.fromStateName,
                    },
                    {
                        key: 'to',
                        label: 'Destino',
                        children: transition!.toStateName,
                    },
                    {
                        key: 'active',
                        label: 'Estado',
                        children: (
                            <Tag color={transition!.isActive ? 'success' : 'default'}>
                                {transition!.isActive ? 'Activa' : 'Inactiva'}
                            </Tag>
                        ),
                    },
                ]}
            />
            <Flex gap={8} className="bpmn-properties__actions">
                {onEditTransition ? (
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEditTransition(transition!)}
                    >
                        Editar
                    </Button>
                ) : null}
                {onDeleteTransition ? (
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={deleting}
                        onClick={() => onDeleteTransition(transition!)}
                    >
                        Eliminar
                    </Button>
                ) : null}
            </Flex>
        </aside>
    )
}
