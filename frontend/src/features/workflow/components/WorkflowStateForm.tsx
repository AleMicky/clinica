import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Radio, Row } from 'antd'

import {
    createWorkflowStateDefaultValues,
    createWorkflowStateSchema,
    updateWorkflowStateSchema,
    type CreateWorkflowStateFormValues,
    type UpdateWorkflowStateFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState } from '../types/workflow.types'

const COMPACT_FORM_CLASS = 'workflow-form--compact'
const FORM_COL = { xs: 24, sm: 12 }

type StateType = 'normal' | 'initial' | 'final'

function getStateType(isInitial: boolean, isFinal: boolean): StateType {
    if (isInitial) return 'initial'
    if (isFinal) return 'final'
    return 'normal'
}

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
        <Drawer
            title={isEditing ? 'Editar estado' : 'Nuevo estado'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            width={520}
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
                <Row gutter={[12, 0]}>
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
                        <form.Field name="color">
                            {(field) => (
                                <Form.Item label="Color" required>
                                    <Input
                                        type="color"
                                        className="workflow-form__color-input"
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
                    </Col>

                    <Col span={24}>
                        <form.Subscribe
                            selector={(formState) => ({
                                isInitial: formState.values.isInitial,
                                isFinal: formState.values.isFinal,
                            })}
                        >
                            {({ isInitial, isFinal }) => (
                                <Form.Item label="Tipo de estado">
                                    <Radio.Group
                                        value={getStateType(isInitial, isFinal)}
                                        optionType="button"
                                        buttonStyle="solid"
                                        className="workflow-form__state-type"
                                        onChange={(event) => {
                                            const stateType = event.target.value as StateType
                                            form.setFieldValue('isInitial', stateType === 'initial')
                                            form.setFieldValue('isFinal', stateType === 'final')
                                        }}
                                        options={[
                                            { label: 'Normal', value: 'normal' },
                                            { label: 'Inicial', value: 'initial' },
                                            { label: 'Final', value: 'final' },
                                        ]}
                                    />
                                </Form.Item>
                            )}
                        </form.Subscribe>
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
