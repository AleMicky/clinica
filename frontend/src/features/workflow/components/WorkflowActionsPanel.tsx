import { useEffect, useMemo, useState } from 'react'
import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    CommentOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Flex, Input, Select, Space, Typography } from 'antd'

import { useWorkflowAssignees } from '../hooks/useWorkflowInstances'
import {
    WorkflowAssignmentType,
    type WorkflowAvailableAction,
} from '../types/workflow.types'
import { WorkflowStateBadge } from './WorkflowStateBadge'

const { Text } = Typography

type WorkflowActionsPanelProps = {
    instanceId: string
    actions: WorkflowAvailableAction[]
    /** Empleado fijo del contenedor (si no hay asignación dinámica). */
    defaultEmployeeId?: string
    loading?: boolean
    submitting?: boolean
    disabled?: boolean
    onExecute: (payload: {
        code: string
        comment: string | null
        employeeId: string
    }) => Promise<void>
}

function actionNeedsAssigneePicker(action: WorkflowAvailableAction | undefined) {
    if (!action?.assignmentType) return false
    return (
        action.assignmentType === WorkflowAssignmentType.Area ||
        action.assignmentType === WorkflowAssignmentType.EmployeeList ||
        action.assignmentType === WorkflowAssignmentType.StoredProcedure
    )
}

export function WorkflowActionsPanel({
    instanceId,
    actions,
    defaultEmployeeId = '',
    loading = false,
    submitting = false,
    disabled = false,
    onExecute,
}: WorkflowActionsPanelProps) {
    const [selectedCode, setSelectedCode] = useState<string | null>(null)
    const [comment, setComment] = useState('')
    const [assigneeId, setAssigneeId] = useState('')

    const selected = useMemo(
        () => actions.find((action) => action.code === selectedCode),
        [actions, selectedCode],
    )

    const needsAssigneePicker = actionNeedsAssigneePicker(selected)

    const assigneesQuery = useWorkflowAssignees(
        needsAssigneePicker ? instanceId : undefined,
        needsAssigneePicker ? selected?.code : undefined,
    )

    const assigneeOptions = useMemo(
        () =>
            (assigneesQuery.data?.items ?? []).map((item) => ({
                value: item.employeeId,
                label: item.employeeName || item.employeeId,
            })),
        [assigneesQuery.data?.items],
    )

    useEffect(() => {
        setSelectedCode(null)
        setComment('')
        setAssigneeId('')
    }, [actions])

    useEffect(() => {
        setAssigneeId('')
        setComment('')
    }, [selectedCode])

    useEffect(() => {
        if (!needsAssigneePicker) return
        if (assigneeOptions.length === 1) {
            setAssigneeId(assigneeOptions[0].value)
        }
    }, [needsAssigneePicker, assigneeOptions])

    if (loading) {
        return <Text type="secondary">Cargando acciones…</Text>
    }

    if (actions.length === 0) {
        return (
            <div className="workflow-actions-panel__empty">
                <Text type="secondary">No hay acciones disponibles en este estado.</Text>
            </div>
        )
    }

    const resolvedEmployeeId = needsAssigneePicker ? assigneeId : defaultEmployeeId
    const canConfirm =
        Boolean(selected) &&
        Boolean(resolvedEmployeeId) &&
        !(selected?.requiresComment && !comment.trim()) &&
        !(needsAssigneePicker && assigneesQuery.isFetching)

    const handleConfirm = async () => {
        if (!selected || !resolvedEmployeeId) return
        if (selected.requiresComment && !comment.trim()) return

        await onExecute({
            code: selected.code,
            comment: comment.trim() || null,
            employeeId: resolvedEmployeeId,
        })

        setSelectedCode(null)
        setComment('')
        setAssigneeId('')
    }

    return (
        <div className="workflow-actions-panel">
            <Text strong className="workflow-actions-panel__title">
                Cambiar estado
            </Text>
            <Text type="secondary" className="workflow-actions-panel__hint">
                Elija una acción disponible. Si tiene asignación, se listarán los ejecutores
                autorizados.
            </Text>

            <div className="workflow-actions-panel__grid">
                {actions.map((action) => {
                    const isSelected = selectedCode === action.code

                    return (
                        <button
                            key={action.code}
                            type="button"
                            className={`workflow-action-chip${isSelected ? ' workflow-action-chip--selected' : ''}`}
                            disabled={disabled || submitting}
                            onClick={() => setSelectedCode(action.code)}
                        >
                            <span className="workflow-action-chip__name">{action.name}</span>
                            <span className="workflow-action-chip__target">
                                <ArrowRightOutlined />
                                <WorkflowStateBadge
                                    name={action.toStateName}
                                    color={action.toStateColor}
                                    code={action.toStateCode}
                                />
                            </span>
                            {action.requiresComment ? (
                                <span className="workflow-action-chip__meta">
                                    <CommentOutlined /> Comentario requerido
                                </span>
                            ) : null}
                            {action.assignmentType ? (
                                <span className="workflow-action-chip__meta">
                                    <UserOutlined /> Asignación
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>

            {selected ? (
                <div className="workflow-actions-panel__confirm">
                    <Flex vertical gap={10}>
                        <Text>
                            Confirmar <Text strong>{selected.name}</Text> →{' '}
                            <WorkflowStateBadge
                                name={selected.toStateName}
                                color={selected.toStateColor}
                                code={selected.toStateCode}
                            />
                        </Text>

                        {needsAssigneePicker ? (
                            <>
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Seleccione ejecutor autorizado"
                                    loading={assigneesQuery.isFetching}
                                    options={assigneeOptions}
                                    value={assigneeId || undefined}
                                    onChange={(value) => setAssigneeId(value)}
                                    disabled={submitting}
                                    notFoundContent={
                                        assigneesQuery.isFetching
                                            ? 'Cargando…'
                                            : 'Sin ejecutores disponibles'
                                    }
                                />
                                {!assigneesQuery.isFetching && assigneeOptions.length === 0 ? (
                                    <Alert
                                        type="warning"
                                        showIcon
                                        message="El procedimiento no devolvió ejecutores para esta instancia."
                                    />
                                ) : null}
                            </>
                        ) : !defaultEmployeeId ? (
                            <Alert
                                type="info"
                                showIcon
                                message="Seleccione un empleado ejecutor en el panel superior."
                            />
                        ) : null}

                        {selected.requiresComment ? (
                            <Input.TextArea
                                rows={3}
                                placeholder="Escriba el comentario obligatorio…"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                disabled={submitting}
                            />
                        ) : (
                            <Input.TextArea
                                rows={2}
                                placeholder="Comentario opcional…"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                disabled={submitting}
                            />
                        )}

                        <Space>
                            <Button
                                onClick={() => {
                                    setSelectedCode(null)
                                    setComment('')
                                    setAssigneeId('')
                                }}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                loading={submitting}
                                disabled={!canConfirm || disabled}
                                onClick={() => void handleConfirm()}
                            >
                                Confirmar cambio
                            </Button>
                        </Space>
                    </Flex>
                </div>
            ) : null}
        </div>
    )
}
