import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Checkbox, Form, Input, Modal, Select } from 'antd'

import {
    createWorkflowTransitionDefaultValues,
    createWorkflowTransitionSchema,
    updateWorkflowTransitionSchema,
    type CreateWorkflowTransitionFormValues,
    type UpdateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'

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
        <Modal
            title={isEditing ? 'Editar transición' : 'Nueva transición'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            confirmLoading={loading}
            destroyOnHidden
            width={620}
        >
            <Form layout="vertical">
                <form.Field name="fromStateId">
                    {(field) => (
                        <Form.Item label="Estado origen" required>
                            <Select
                                options={stateOptions}
                                value={field.state.value || undefined}
                                onChange={(value) => field.handleChange(value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="toStateId">
                    {(field) => (
                        <Form.Item label="Estado destino" required>
                            <Select
                                options={stateOptions}
                                value={field.state.value || undefined}
                                onChange={(value) => field.handleChange(value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="actionCode">
                    {(field) => (
                        <Form.Item label="Código de acción" required>
                            <Input
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="actionName">
                    {(field) => (
                        <Form.Item label="Nombre de acción" required>
                            <Input
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="description">
                    {(field) => (
                        <Form.Item label="Descripción">
                            <Input.TextArea
                                rows={2}
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="requiredRole">
                    {(field) => (
                        <Form.Item label="Rol requerido">
                            <Input
                                placeholder="Opcional"
                                value={field.state.value ?? ''}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="requiresComment">
                    {(field) => (
                        <Form.Item>
                            <Checkbox
                                checked={field.state.value}
                                onChange={(event) => field.handleChange(event.target.checked)}
                            >
                                Requiere comentario
                            </Checkbox>
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="isActive">
                    {(field) => (
                        <Form.Item>
                            <Checkbox
                                checked={field.state.value}
                                onChange={(event) => field.handleChange(event.target.checked)}
                            >
                                Activa
                            </Checkbox>
                        </Form.Item>
                    )}
                </form.Field>
            </Form>
        </Modal>
    )
}
