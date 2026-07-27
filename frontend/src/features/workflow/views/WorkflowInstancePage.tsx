import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
    Button,
    Card,
    Descriptions,
    Flex,
    Form,
    Input,
    Select,
    Tag,
    Typography,
    theme,
} from 'antd'

import { WorkflowStateBadge } from '../components/WorkflowStateBadge'
import { WorkflowTimeline } from '../components/WorkflowTimeline'
import {
    useExecuteWorkflowTransition,
    useWorkflowAvailableActions,
    useWorkflowHistory,
    useWorkflowInstance,
} from '../hooks/useWorkflowInstances'
import {
    executeWorkflowTransitionDefaultValues,
    executeWorkflowTransitionSchema,
} from '../schemas/workflow.schemas'

const { Title, Text } = Typography

type WorkflowInstancePageProps = {
    instanceId: string
}

export function WorkflowInstancePage({ instanceId }: WorkflowInstancePageProps) {
    const { token } = theme.useToken()

    const { data: instance, isFetching: loadingInstance } = useWorkflowInstance(instanceId)
    const { data: actions = [], isFetching: loadingActions } =
        useWorkflowAvailableActions(instanceId)
    const { data: history = [], isFetching: loadingHistory } = useWorkflowHistory(instanceId)
    const executeTransition = useExecuteWorkflowTransition(instanceId)

    const form = useForm({
        defaultValues: executeWorkflowTransitionDefaultValues,
        validators: { onSubmit: executeWorkflowTransitionSchema },
        onSubmit: async ({ value }) => {
            const selectedAction = actions.find((action) => action.code === value.code)

            if (selectedAction?.requiresComment && !value.comment?.trim()) {
                throw new Error('Se requiere un comentario para esta acción.')
            }

            await executeTransition.mutateAsync({
                code: value.code,
                employeeId: value.employeeId,
                comment: value.comment?.trim() || null,
            })

            form.reset()
        },
    })

    useEffect(() => {
        form.reset()
    }, [instance?.currentStateId, form])

    const actionOptions = actions.map((action) => ({
        value: action.code,
        label: action.name,
    }))

    return (
        <div className="workflow-instance-page">
            <Flex vertical gap={16}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Instancia de workflow
                    </Title>
                    <Text type="secondary">
                        {instance?.workflowDefinitionName ?? 'Cargando…'}
                    </Text>
                </div>

                <Card title="Datos de la instancia" loading={loadingInstance}>
                    {instance ? (
                        <Descriptions column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Referencia">
                                {instance.referenceModule} / {instance.referenceEntity} / {instance.referenceId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Estado actual">
                                <WorkflowStateBadge
                                    name={instance.currentStateName}
                                    color={instance.currentStateColor}
                                    code={instance.currentStateCode}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Completada">
                                <Tag color={instance.isCompleted ? 'success' : 'processing'}>
                                    {instance.isCompleted ? 'Sí' : 'No'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Iniciada por (empleado)">
                                {instance.startedByEmployeeId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Inicio">
                                {new Date(instance.startedAt).toLocaleString('es-BO')}
                            </Descriptions.Item>
                            {instance.finishedAt ? (
                                <Descriptions.Item label="Finalización">
                                    {new Date(instance.finishedAt).toLocaleString('es-BO')}
                                </Descriptions.Item>
                            ) : null}
                        </Descriptions>
                    ) : null}
                </Card>

                {!instance?.isCompleted ? (
                    <Card title="Ejecutar transición" loading={loadingActions}>
                        {actions.length === 0 ? (
                            <Text type="secondary">No hay acciones disponibles para el estado actual.</Text>
                        ) : (
                            <Form layout="vertical">
                                <form.Subscribe selector={(state) => state.values.code}>
                                    {(selectedCode) => {
                                        const selectedAction = actions.find(
                                            (action) => action.code === selectedCode,
                                        )

                                        return (
                                            <>
                                                <form.Field name="code">
                                                    {(field) => (
                                                        <Form.Item label="Acción" required>
                                                            <Select
                                                                placeholder="Seleccione una acción"
                                                                options={actionOptions}
                                                                value={field.state.value || undefined}
                                                                onChange={(value) => field.handleChange(value)}
                                                            />
                                                        </Form.Item>
                                                    )}
                                                </form.Field>

                                                <form.Field name="employeeId">
                                                    {(field) => (
                                                        <Form.Item label="Empleado ejecutor (UUID)" required>
                                                            <Input
                                                                value={field.state.value}
                                                                onChange={(event) =>
                                                                    field.handleChange(event.target.value)
                                                                }
                                                            />
                                                        </Form.Item>
                                                    )}
                                                </form.Field>

                                                {selectedAction?.requiresComment ? (
                                                    <form.Field name="comment">
                                                        {(field) => (
                                                            <Form.Item label="Comentario" required>
                                                                <Input.TextArea
                                                                    rows={3}
                                                                    value={field.state.value ?? ''}
                                                                    onChange={(event) =>
                                                                        field.handleChange(event.target.value)
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        )}
                                                    </form.Field>
                                                ) : null}
                                            </>
                                        )
                                    }}
                                </form.Subscribe>

                                <Button
                                    type="primary"
                                    loading={executeTransition.isPending}
                                    onClick={() => void form.handleSubmit()}
                                >
                                    Ejecutar
                                </Button>
                            </Form>
                        )}
                    </Card>
                ) : null}

                <Card
                    title="Historial"
                    style={{ background: token.colorBgContainer }}
                    loading={loadingHistory}
                >
                    <WorkflowTimeline history={history} />
                </Card>
            </Flex>
        </div>
    )
}
