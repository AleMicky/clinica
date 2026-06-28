import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Checkbox, Form, Input, InputNumber, Modal } from 'antd'

import {
    createWorkflowStateDefaultValues,
    createWorkflowStateSchema,
    updateWorkflowStateSchema,
    type CreateWorkflowStateFormValues,
    type UpdateWorkflowStateFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState } from '../types/workflow.types'

type WorkflowStateFormProps = {
    open: boolean
    state: WorkflowState | null
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateWorkflowStateFormValues) => Promise<void>
    onUpdate: (values: UpdateWorkflowStateFormValues) => Promise<void>
}

export function WorkflowStateForm({
    open,
    state,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: WorkflowStateFormProps) {
    const isEditing = state !== null

    const createForm = useForm({
        defaultValues: createWorkflowStateDefaultValues,
        validators: { onSubmit: createWorkflowStateSchema },
        onSubmit: async ({ value }) => {
            await onCreate(value)
        },
    })

    const updateForm = useForm({
        defaultValues: createWorkflowStateDefaultValues,
        validators: { onSubmit: updateWorkflowStateSchema },
        onSubmit: async ({ value }) => {
            await onUpdate(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (state) {
            updateForm.reset()
            updateForm.setFieldValue('code', state.code)
            updateForm.setFieldValue('name', state.name)
            updateForm.setFieldValue('description', state.description)
            updateForm.setFieldValue('isInitial', state.isInitial)
            updateForm.setFieldValue('isFinal', state.isFinal)
            updateForm.setFieldValue('color', state.color)
            updateForm.setFieldValue('order', state.order)
            return
        }

        createForm.reset()
    }, [open, state, createForm, updateForm])

    const form = isEditing ? updateForm : createForm

    return (
        <Modal
            title={isEditing ? 'Editar estado' : 'Nuevo estado'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            confirmLoading={loading}
            destroyOnHidden
            width={520}
        >
            <Form layout="vertical">
                <form.Field name="code">
                    {(field) => (
                        <Form.Item label="Código" required>
                            <Input
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="name">
                    {(field) => (
                        <Form.Item label="Nombre" required>
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

                <form.Field name="color">
                    {(field) => (
                        <Form.Item label="Color" required>
                            <Input
                                type="color"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="order">
                    {(field) => (
                        <Form.Item label="Orden">
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                value={field.state.value}
                                onChange={(value) => field.handleChange(value ?? 0)}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="isInitial">
                    {(field) => (
                        <Form.Item>
                            <Checkbox
                                checked={field.state.value}
                                onChange={(event) => field.handleChange(event.target.checked)}
                            >
                                Estado inicial
                            </Checkbox>
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="isFinal">
                    {(field) => (
                        <Form.Item>
                            <Checkbox
                                checked={field.state.value}
                                onChange={(event) => field.handleChange(event.target.checked)}
                            >
                                Estado final
                            </Checkbox>
                        </Form.Item>
                    )}
                </form.Field>
            </Form>
        </Modal>
    )
}
