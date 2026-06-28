import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row, Switch } from 'antd'

import {
    createWorkflowDefinitionDefaultValues,
    createWorkflowDefinitionSchema,
    updateWorkflowDefinitionSchema,
    type CreateWorkflowDefinitionFormValues,
    type UpdateWorkflowDefinitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowDefinition } from '../types/workflow.types'

const COMPACT_FORM_CLASS = 'workflow-form--compact'
const FORM_COL = { xs: 24, sm: 12 }

type WorkflowDefinitionFormProps = {
    open: boolean
    definition: WorkflowDefinition | null
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateWorkflowDefinitionFormValues) => Promise<void>
    onUpdate: (values: UpdateWorkflowDefinitionFormValues) => Promise<void>
}

function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

export function WorkflowDefinitionForm({
    open,
    definition,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: WorkflowDefinitionFormProps) {
    const isEditing = definition !== null

    const createForm = useForm({
        defaultValues: createWorkflowDefinitionDefaultValues,
        validators: { onSubmit: createWorkflowDefinitionSchema },
        onSubmit: async ({ value }) => {
            await onCreate({
                ...value,
                isActive: value.isActive ?? true,
            })
        },
    })

    const updateForm = useForm({
        defaultValues: createWorkflowDefinitionDefaultValues,
        validators: { onSubmit: updateWorkflowDefinitionSchema },
        onSubmit: async ({ value }) => {
            await onUpdate({
                ...value,
                isActive: value.isActive ?? true,
            })
        },
    })

    useEffect(() => {
        if (!open) return

        if (definition) {
            updateForm.reset()
            updateForm.setFieldValue('code', definition.code)
            updateForm.setFieldValue('name', definition.name)
            updateForm.setFieldValue('description', definition.description)
            updateForm.setFieldValue('module', definition.module)
            updateForm.setFieldValue('entityName', definition.entityName)
            updateForm.setFieldValue('isActive', definition.isActive)
            return
        }

        createForm.reset()
    }, [open, definition, createForm, updateForm])

    const form = isEditing ? updateForm : createForm

    return (
        <Drawer
            title={isEditing ? 'Editar workflow' : 'Nuevo workflow'}
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
                                <Form.Item
                                    label="Código"
                                    validateStatus={
                                        field.state.meta.errors.length ? 'error' : undefined
                                    }
                                    help={getFieldError(field.state.meta.errors)}
                                    required
                                >
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
                                <Form.Item
                                    label="Nombre"
                                    validateStatus={
                                        field.state.meta.errors.length ? 'error' : undefined
                                    }
                                    help={getFieldError(field.state.meta.errors)}
                                    required
                                >
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
                        <form.Field name="module">
                            {(field) => (
                                <Form.Item label="Módulo" required>
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
                        <form.Field name="entityName">
                            {(field) => (
                                <Form.Item label="Entidad" required>
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
                        <form.Field name="isActive">
                            {(field) => (
                                <Form.Item label="Estado">
                                    <Switch
                                        checked={field.state.value}
                                        checkedChildren="Activo"
                                        unCheckedChildren="Inactivo"
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
                                        rows={3}
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
