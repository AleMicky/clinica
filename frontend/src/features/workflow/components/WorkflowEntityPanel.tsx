import { useState } from 'react'
import { HistoryOutlined } from '@ant-design/icons'
import { Alert, Collapse, Empty, Flex, Form, Skeleton, Tag, Typography } from 'antd'

import { getApiErrorMessage } from '../../../shared/utils/api-error'
import {
    getWorkflowEntityLabel,
    getWorkflowModuleLabel,
} from '../constants/workflow-modules'
import {
    useExecuteWorkflowTransition,
    useStartWorkflowInstance,
    useWorkflowAvailableActions,
    useWorkflowHistory,
    useWorkflowInstance,
    useWorkflowInstanceByReference,
} from '../hooks/useWorkflowInstances'
import { useWorkflowEmployeeOptions } from '../hooks/useWorkflowLookups'
import type { WorkflowInstance } from '../types/workflow.types'
import { WorkflowActionsPanel } from './WorkflowActionsPanel'
import { WorkflowEmployeeSelect } from './WorkflowEmployeeSelect'
import { WorkflowStartPanel } from './WorkflowStartPanel'
import { WorkflowStateBadge } from './WorkflowStateBadge'
import { WorkflowTimeline } from './WorkflowTimeline'

const { Text, Title } = Typography

export type WorkflowEntityPanelProps = {
    /** Resolver por referencia de entidad de dominio (recomendado para módulos). */
    referenceModule?: string
    referenceEntity?: string
    referenceId?: string
    /** Resolver por id de instancia (página admin). */
    instanceId?: string
    /** Código de definición para poder iniciar si no existe instancia. */
    definitionCode?: string
    /** Empleado ejecutor. Si no se pasa, se muestra un selector. */
    employeeId?: string
    title?: string
    showHistory?: boolean
    /** Abre el historial al montar (útil en la página de instancia). */
    historyDefaultOpen?: boolean
    allowStart?: boolean
    /** card = panel autónomo; embedded = sin marco, para insertar en otra vista. */
    variant?: 'card' | 'embedded'
    className?: string
    onStateChange?: (instance: WorkflowInstance) => void
}

export function WorkflowEntityPanel({
    referenceModule,
    referenceEntity,
    referenceId,
    instanceId: instanceIdProp,
    definitionCode,
    employeeId: employeeIdProp,
    title = 'Workflow',
    showHistory = true,
    historyDefaultOpen = false,
    allowStart = true,
    variant = 'card',
    className,
    onStateChange,
}: WorkflowEntityPanelProps) {
    const [localEmployeeId, setLocalEmployeeId] = useState('')
    const employeeId = employeeIdProp || localEmployeeId

    const byReference = Boolean(referenceModule && referenceEntity && referenceId && !instanceIdProp)

    const referenceQuery = useWorkflowInstanceByReference(
        byReference ? referenceModule : undefined,
        byReference ? referenceEntity : undefined,
        byReference ? referenceId : undefined,
    )

    const resolvedInstanceId = instanceIdProp ?? referenceQuery.data?.id
    const instanceQuery = useWorkflowInstance(
        instanceIdProp ? instanceIdProp : undefined,
    )

    const instance = instanceIdProp ? instanceQuery.data : referenceQuery.data ?? undefined
    const instanceError = instanceIdProp
        ? instanceQuery.error
        : byReference
          ? referenceQuery.error
          : null
    const loadingInstance =
        (byReference && referenceQuery.isFetching) ||
        (Boolean(instanceIdProp) && instanceQuery.isFetching)

    const { data: actions = [], isFetching: loadingActions } =
        useWorkflowAvailableActions(resolvedInstanceId)
    const { data: history = [], isFetching: loadingHistory } =
        useWorkflowHistory(showHistory ? resolvedInstanceId : undefined)
    const { nameById } = useWorkflowEmployeeOptions()

    const startMutation = useStartWorkflowInstance()
    const executeMutation = useExecuteWorkflowTransition(resolvedInstanceId ?? '')

    const missingReference =
        !instanceIdProp && !(referenceModule && referenceEntity && referenceId)

    const handleStart = async () => {
        if (!definitionCode || !referenceModule || !referenceEntity || !referenceId) return
        if (!employeeId) return

        const created = await startMutation.mutateAsync({
            workflowDefinitionCode: definitionCode,
            referenceModule,
            referenceEntity,
            referenceId,
            employeeId,
        })

        onStateChange?.(created)
    }

    const handleExecute = async (payload: {
        code: string
        comment: string | null
        employeeId: string
    }) => {
        if (!resolvedInstanceId) return

        const updated = await executeMutation.mutateAsync({
            code: payload.code,
            employeeId: payload.employeeId,
            comment: payload.comment,
        })

        onStateChange?.(updated)
    }

    const rootClass = [
        'workflow-entity-panel',
        variant === 'card' ? 'workflow-entity-panel--card' : 'workflow-entity-panel--embedded',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    if (missingReference) {
        return (
            <div className={rootClass}>
                <Alert
                    type="warning"
                    showIcon
                    message="Configuración incompleta"
                    description="Indique instanceId o la terna referenceModule / referenceEntity / referenceId."
                />
            </div>
        )
    }

    return (
        <div className={rootClass}>
            <div className="workflow-entity-panel__header">
                <div>
                    <Title level={5} className="workflow-entity-panel__title">
                        {title}
                    </Title>
                    {referenceModule && referenceEntity ? (
                        <Text type="secondary" className="workflow-entity-panel__ref">
                            {getWorkflowModuleLabel(referenceModule)} ·{' '}
                            {getWorkflowEntityLabel(referenceModule, referenceEntity)}
                        </Text>
                    ) : instance ? (
                        <Text type="secondary" className="workflow-entity-panel__ref">
                            {instance.workflowDefinitionName}
                        </Text>
                    ) : null}
                </div>

                {instance ? (
                    <div className="workflow-entity-panel__status">
                        <WorkflowStateBadge
                            name={instance.currentStateName}
                            color={instance.currentStateColor}
                            code={instance.currentStateCode}
                        />
                        <Tag color={instance.isCompleted ? 'success' : 'processing'}>
                            {instance.isCompleted ? 'Completado' : 'En curso'}
                        </Tag>
                    </div>
                ) : null}
            </div>

            {!employeeIdProp ? (
                <Form layout="vertical" className="workflow-entity-panel__employee">
                    <Form.Item
                        label="Empleado ejecutor"
                        required
                        style={{ marginBottom: 12 }}
                    >
                        <WorkflowEmployeeSelect
                            value={localEmployeeId}
                            onChange={(value) => setLocalEmployeeId(value as string)}
                            placeholder="Quién ejecuta la acción"
                        />
                    </Form.Item>
                </Form>
            ) : null}

            {loadingInstance ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : instanceError ? (
                <Alert
                    type="error"
                    showIcon
                    message="No se pudo cargar la instancia"
                    description={getApiErrorMessage(instanceError)}
                />
            ) : !instance ? (
                allowStart ? (
                    <WorkflowStartPanel
                        definitionCode={definitionCode}
                        loading={startMutation.isPending}
                        disabled={!employeeId}
                        onStart={handleStart}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Sin instancia de workflow"
                    />
                )
            ) : (
                <Flex vertical gap={16}>
                    <div className="workflow-entity-panel__meta">
                        <div>
                            <Text type="secondary">Definición</Text>
                            <div>
                                <Text strong>{instance.workflowDefinitionName}</Text>
                                <Text type="secondary"> · {instance.workflowDefinitionCode}</Text>
                            </div>
                        </div>
                        <div>
                            <Text type="secondary">Referencia</Text>
                            <div>
                                <Text>
                                    {getWorkflowModuleLabel(instance.referenceModule)} ·{' '}
                                    {getWorkflowEntityLabel(
                                        instance.referenceModule,
                                        instance.referenceEntity,
                                    )}
                                </Text>
                            </div>
                        </div>
                        <div>
                            <Text type="secondary">Inicio</Text>
                            <div>{new Date(instance.startedAt).toLocaleString('es-BO')}</div>
                        </div>
                    </div>

                    {!instance.isCompleted ? (
                        <WorkflowActionsPanel
                            instanceId={instance.id}
                            actions={actions}
                            defaultEmployeeId={employeeId}
                            loading={loadingActions}
                            submitting={executeMutation.isPending}
                            disabled={false}
                            onExecute={handleExecute}
                        />
                    ) : (
                        <Alert
                            type="success"
                            showIcon
                            message="Workflow finalizado"
                            description="No hay más acciones disponibles."
                        />
                    )}

                    {showHistory ? (
                        <Collapse
                            ghost
                            className="workflow-entity-panel__history"
                            defaultActiveKey={historyDefaultOpen ? ['history'] : undefined}
                            items={[
                                {
                                    key: 'history',
                                    label: (
                                        <Flex align="center" gap={8}>
                                            <HistoryOutlined />
                                            <span>Historial</span>
                                            <Tag>{history.length}</Tag>
                                        </Flex>
                                    ),
                                    children: (
                                        <WorkflowTimeline
                                            history={history}
                                            loading={loadingHistory}
                                            employeeNameById={nameById}
                                        />
                                    ),
                                },
                            ]}
                        />
                    ) : null}
                </Flex>
            )}
        </div>
    )
}
