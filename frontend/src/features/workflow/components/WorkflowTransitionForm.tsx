import { useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { ArrowRightOutlined } from '@ant-design/icons'
import {
    Button,
    Col,
    Drawer,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Switch,
} from 'antd'

import { useRoles } from '../../roles/hooks/roles.hooks'
import {
    createWorkflowTransitionDefaultValues,
    createWorkflowTransitionSchema,
    updateWorkflowTransitionSchema,
    type CreateWorkflowTransitionFormValues,
    type UpdateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'
import { WorkflowStateBadge } from './WorkflowStateBadge'

const COMPACT_FORM_CLASS = 'workflow-form--compact'
const FORM_COL = { xs: 24, sm: 12 }

type WorkflowTransitionFormProps = {
    open: boolean
    transition: WorkflowTransition | null
    states: WorkflowState[]
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateWorkflowTransitionFormValues) => Promise<void>
    onUpdate: (values: UpdateWorkflowTransitionFormValues) => Promise<void>
}

export function WorkflowTransitionForm({
    open,
    transition,
    states,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: WorkflowTransitionFormProps) {
    const isEditing = transition !== null

    const { data: rolesData } = useRoles({ page: 1, pageSize: 100 })
    const roleOptions = useMemo(
        () =>
            (rolesData?.items ?? []).map((role) => ({
                value: role.name,
                label: role.name,
            })),
        [rolesData?.items],
    )
    const hasRoles = roleOptions.length > 0

    const stateOptions = states.map((state) => ({
        value: state.id,
        label: `${state.code} · ${state.name}`,
    }))

    const createForm = useForm({
        defaultValues: createWorkflowTransitionDefaultValues,
        validators: { onSubmit: createWorkflowTransitionSchema },
        onSubmit: async ({ value }) => {
            await onCreate({
                ...value,
                requiredRole: value.requiredRole || null,
                isActive: value.isActive ?? true,
            })
        },
    })

    const updateForm = useForm({
        defaultValues: createWorkflowTransitionDefaultValues,
        validators: { onSubmit: updateWorkflowTransitionSchema },
        onSubmit: async ({ value }) => {
            await onUpdate({
                ...value,
                requiredRole: value.requiredRole || null,
                isActive: value.isActive ?? true,
            })
        },
    })

    useEffect(() => {
        if (!open) return

        if (transition) {
            updateForm.reset()
            updateForm.setFieldValue('fromStateId', transition.fromStateId)
            updateForm.setFieldValue('toStateId', transition.toStateId)
            updateForm.setFieldValue('actionCode', transition.actionCode)
            updateForm.setFieldValue('actionName', transition.actionName)
            updateForm.setFieldValue('description', transition.description)
            updateForm.setFieldValue('requiredRole', transition.requiredRole ?? '')
            updateForm.setFieldValue('requiresComment', transition.requiresComment)
            updateForm.setFieldValue('isActive', transition.isActive)
            return
        }

        createForm.reset()
    }, [open, transition, createForm, updateForm])

    const form = isEditing ? updateForm : createForm

    return (
        <Drawer
            title={isEditing ? 'Editar transición' : 'Nueva transición'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            size={560}
            destroyOnHidden
            className="workflow-drawer"
            footer={
                <Flex justify="flex-end" gap={8}>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void form.handleSubmit()}
                    >
                        Guardar
                    </Button>
                </Flex>
            }
        >
            <Form layout="vertical" className={COMPACT_FORM_CLASS}>
                <form.Subscribe
                    selector={(formState) => ({
                        fromStateId: formState.values.fromStateId,
                        toStateId: formState.values.toStateId,
                        actionName: formState.values.actionName,
                    })}
                >
                    {({ fromStateId, toStateId, actionName }) => {
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
                                    {actionName?.trim() || 'Acción'}
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
                                        value={field.state.value || undefined}
                                        onChange={(value) => field.handleChange(value)}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col {...FORM_COL}>
                        <form.Field name="actionCode">
                            {(field) => (
                                <Form.Item label="Código de acción" required>
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
                        <form.Field name="actionName">
                            {(field) => (
                                <Form.Item label="Nombre de acción" required>
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
                        <form.Field name="requiredRole">
                            {(field) => (
                                <Form.Item label="Rol requerido">
                                    {hasRoles ? (
                                        <Select
                                            allowClear
                                            showSearch
                                            placeholder="Opcional"
                                            options={roleOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
                                            }
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value ?? ''}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                        />
                                    )}
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

                    <Col span={24}>
                        <form.Field name="description">
                            {(field) => (
                                <Form.Item label="Descripción">
                                    <Input.TextArea
                                        rows={2}
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}
