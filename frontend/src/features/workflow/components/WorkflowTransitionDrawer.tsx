import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons'
import {
    Button,
    Col,
    Divider,
    Drawer,
    Flex,
    Form,
    Input,
    Popconfirm,
    Row,
    Select,
    Switch,
} from 'antd'

import { notify } from '../../../shared/utils/notify'
import {
    createWorkflowTransitionDefaultValues,
    createWorkflowTransitionSchema,
    updateWorkflowTransitionSchema,
    type CreateWorkflowTransitionFormValues,
    type UpdateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type {
    WorkflowCustomQuery,
    WorkflowState,
    WorkflowTransition,
} from '../types/workflow.types'
import { WorkflowAssignmentType } from '../types/workflow.types'
import { WorkflowAssignmentFields } from './WorkflowAssignmentFields'
import { WorkflowStateBadge } from './WorkflowStateBadge'

const COMPACT_FORM_CLASS = 'workflow-form--compact'
const FORM_COL = { xs: 24, sm: 12 }

type WorkflowTransitionDrawerProps = {
    open: boolean
    mode: 'create' | 'edit'
    transition: WorkflowTransition | null
    states: WorkflowState[]
    customQueries?: WorkflowCustomQuery[]
    existingTransitions: WorkflowTransition[]
    initialFromStateId?: string
    initialToStateId?: string
    lockFromState?: boolean
    lockToState?: boolean
    loading: boolean
    deleting?: boolean
    onClose: () => void
    onCreate: (values: CreateWorkflowTransitionFormValues) => Promise<void>
    onUpdate: (values: UpdateWorkflowTransitionFormValues) => Promise<void>
    onDelete?: (id: string) => Promise<void>
}

function findDuplicateTransition(
    transitions: WorkflowTransition[],
    fromStateId: string,
    toStateId: string,
    code: string,
    excludeId?: string,
): WorkflowTransition | undefined {
    const normalizedCode = code.trim().toLowerCase()
    return transitions.find(
        (item) =>
            item.fromStateId === fromStateId &&
            item.toStateId === toStateId &&
            item.code.trim().toLowerCase() === normalizedCode &&
            item.id !== excludeId,
    )
}

export function WorkflowTransitionDrawer({
    open,
    mode,
    transition,
    states,
    customQueries = [],
    existingTransitions,
    initialFromStateId,
    initialToStateId,
    lockFromState = false,
    lockToState = false,
    loading,
    deleting = false,
    onClose,
    onCreate,
    onUpdate,
    onDelete,
}: WorkflowTransitionDrawerProps) {
    const isEditing = mode === 'edit' && transition !== null

    const stateOptions = states.map((state) => ({
        value: state.id,
        label: `${state.code} · ${state.name}`,
    }))

    const createForm = useForm({
        defaultValues: createWorkflowTransitionDefaultValues,
        validators: { onSubmit: createWorkflowTransitionSchema },
        onSubmit: async ({ value }) => {
            const duplicate = findDuplicateTransition(
                existingTransitions,
                value.fromStateId,
                value.toStateId,
                value.code,
            )
            if (duplicate) {
                notify.error(
                    'Transición duplicada',
                    'Ya existe una transición con el mismo origen, destino y código.',
                )
                return
            }

            await onCreate({
                ...value,
                isActive: value.isActive ?? true,
            })
        },
    })

    const updateForm = useForm({
        defaultValues: createWorkflowTransitionDefaultValues,
        validators: { onSubmit: updateWorkflowTransitionSchema },
        onSubmit: async ({ value }) => {
            const duplicate = findDuplicateTransition(
                existingTransitions,
                value.fromStateId,
                value.toStateId,
                value.code,
                transition?.id,
            )
            if (duplicate) {
                notify.error(
                    'Transición duplicada',
                    'Ya existe una transición con el mismo origen, destino y código.',
                )
                return
            }

            await onUpdate({
                ...value,
                isActive: value.isActive ?? true,
            })
        },
    })

    useEffect(() => {
        if (!open) return

        if (isEditing && transition) {
            updateForm.reset()
            updateForm.setFieldValue('fromStateId', transition.fromStateId)
            updateForm.setFieldValue('toStateId', transition.toStateId)
            updateForm.setFieldValue('code', transition.code)
            updateForm.setFieldValue('name', transition.name)
            updateForm.setFieldValue('requiresComment', transition.requiresComment)
            updateForm.setFieldValue('isActive', transition.isActive)
            updateForm.setFieldValue('assignment.enabled', Boolean(transition.assignment))
            updateForm.setFieldValue(
                'assignment.type',
                transition.assignment?.type ?? WorkflowAssignmentType.Area,
            )
            updateForm.setFieldValue('assignment.areaId', transition.assignment?.areaId ?? '')
            updateForm.setFieldValue(
                'assignment.workflowCustomQueryId',
                transition.assignment?.workflowCustomQueryId ?? '',
            )
            updateForm.setFieldValue(
                'assignment.employeeIds',
                transition.assignment?.employeeIds ?? [],
            )
            return
        }

        createForm.reset()
        if (initialFromStateId) {
            createForm.setFieldValue('fromStateId', initialFromStateId)
        }
        if (initialToStateId) {
            createForm.setFieldValue('toStateId', initialToStateId)
        }
    }, [
        open,
        isEditing,
        transition,
        initialFromStateId,
        initialToStateId,
        createForm,
        updateForm,
    ])

    const form = isEditing ? updateForm : createForm

    return (
        <Drawer
            title={isEditing ? 'Editar transición' : 'Nueva transición'}
            open={open}
            onClose={() => {
                if (!loading && !deleting) onClose()
            }}
            size={560}
            destroyOnHidden
            className="workflow-drawer workflow-drawer--transition"
            footer={
                <Flex justify="space-between" align="center" wrap gap={8}>
                    {isEditing && transition && onDelete ? (
                        <Popconfirm
                            title="Eliminar transición"
                            description={`¿Desea eliminar "${transition.name}"?`}
                            okText="Eliminar"
                            okType="danger"
                            cancelText="Cancelar"
                            onConfirm={() => void onDelete(transition.id)}
                            disabled={loading || deleting}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleting}
                                disabled={loading}
                            >
                                Eliminar
                            </Button>
                        </Popconfirm>
                    ) : (
                        <span />
                    )}
                    <Flex gap={8}>
                        <Button onClick={onClose} disabled={loading || deleting}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary"
                            loading={loading}
                            disabled={deleting}
                            onClick={() => void form.handleSubmit()}
                        >
                            Guardar
                        </Button>
                    </Flex>
                </Flex>
            }
        >
            <Form layout="vertical" className={COMPACT_FORM_CLASS}>
                <form.Subscribe
                    selector={(formState) => ({
                        fromStateId: formState.values.fromStateId,
                        toStateId: formState.values.toStateId,
                        name: formState.values.name,
                    })}
                >
                    {({ fromStateId, toStateId, name }) => {
                        const fromState = states.find((state) => state.id === fromStateId)
                        const toState = states.find((state) => state.id === toStateId)

                        if (!fromState || !toState) return null

                        return (
                            <div className="workflow-transition-preview">
                                <WorkflowStateBadge
                                    name={fromState.name}
                                    color={fromState.color}
                                    code={fromState.code}
                                />
                                <ArrowRightOutlined className="workflow-transition-preview__arrow" />
                                <span className="workflow-transition-preview__action">
                                    {name?.trim() || 'Acción'}
                                </span>
                                <ArrowRightOutlined className="workflow-transition-preview__arrow" />
                                <WorkflowStateBadge
                                    name={toState.name}
                                    color={toState.color}
                                    code={toState.code}
                                />
                            </div>
                        )
                    }}
                </form.Subscribe>

                <Row gutter={[12, 0]}>
                    <Col {...FORM_COL}>
                        <form.Field name="fromStateId">
                            {(field) => (
                                <Form.Item label="Estado origen" required>
                                    <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Seleccione origen"
                                        options={stateOptions}
                                        disabled={lockFromState}
                                        value={field.state.value || undefined}
                                        onChange={(value) => field.handleChange(value)}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="toStateId">
                            {(field) => (
                                <Form.Item label="Estado destino" required>
                                    <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Seleccione destino"
                                        options={stateOptions}
                                        disabled={lockToState}
                                        value={field.state.value || undefined}
                                        onChange={(value) => field.handleChange(value)}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="code">
                            {(field) => (
                                <Form.Item label="Código" required>
                                    <Input
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="name">
                            {(field) => (
                                <Form.Item label="Nombre" required>
                                    <Input
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="requiresComment">
                            {(field) => (
                                <Form.Item label="Requiere comentario">
                                    <Switch
                                        checked={field.state.value}
                                        checkedChildren="Sí"
                                        unCheckedChildren="No"
                                        onChange={(checked) => field.handleChange(checked)}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="isActive">
                            {(field) => (
                                <Form.Item label="Estado">
                                    <Switch
                                        checked={field.state.value}
                                        checkedChildren="Activa"
                                        unCheckedChildren="Inactiva"
                                        onChange={(checked) => field.handleChange(checked)}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>

                <Divider style={{ margin: '8px 0 16px' }} />
                <WorkflowAssignmentFields form={form} customQueries={customQueries} />
            </Form>
        </Drawer>
    )
}
