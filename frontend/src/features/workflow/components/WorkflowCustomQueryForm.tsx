import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row } from 'antd'

import {
    createWorkflowCustomQueryDefaultValues,
    createWorkflowCustomQuerySchema,
    updateWorkflowCustomQuerySchema,
    type CreateWorkflowCustomQueryFormValues,
    type UpdateWorkflowCustomQueryFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowCustomQuery } from '../types/workflow.types'

const COMPACT_FORM_CLASS = 'workflow-form--compact'
const FORM_COL = { xs: 24, sm: 12 }

type WorkflowCustomQueryFormProps = {
    open: boolean
    entity: WorkflowCustomQuery | null
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateWorkflowCustomQueryFormValues) => Promise<void>
    onUpdate: (values: UpdateWorkflowCustomQueryFormValues) => Promise<void>
}

export function WorkflowCustomQueryForm({
    open,
    entity,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: WorkflowCustomQueryFormProps) {
    const isEditing = entity !== null

    const createForm = useForm({
        defaultValues: createWorkflowCustomQueryDefaultValues,
        validators: { onSubmit: createWorkflowCustomQuerySchema },
        onSubmit: async ({ value }) => {
            await onCreate({
                ...value,
                description: value.description?.trim() || null,
            })
        },
    })

    const updateForm = useForm({
        defaultValues: createWorkflowCustomQueryDefaultValues,
        validators: { onSubmit: updateWorkflowCustomQuerySchema },
        onSubmit: async ({ value }) => {
            await onUpdate({
                ...value,
                description: value.description?.trim() || null,
            })
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            updateForm.reset()
            updateForm.setFieldValue('code', entity.code)
            updateForm.setFieldValue('name', entity.name)
            updateForm.setFieldValue('description', entity.description ?? '')
            updateForm.setFieldValue('procedureName', entity.procedureName)
            return
        }

        createForm.reset()
    }, [open, entity, createForm, updateForm])

    const form = isEditing ? updateForm : createForm

    return (
        <Drawer
            title={isEditing ? 'Editar consulta' : 'Nueva consulta personalizada'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            size={480}
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
                    <Col span={24}>
                        <form.Field name="procedureName">
                            {(field) => (
                                <Form.Item label="Procedimiento almacenado" required>
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
                    <Col span={24}>
                        <form.Field name="description">
                            {(field) => (
                                <Form.Item label="Descripción">
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
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}
