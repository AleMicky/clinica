import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Switch, Typography } from 'antd'

import {
    getWorkflowEntityOptions,
    getWorkflowModuleOptions,
} from '../constants/workflow-modules'
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
const { Text } = Typography
const CUSTOM_MODULE_VALUE = '__custom__'

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
    const moduleOptions = [
        ...getWorkflowModuleOptions(),
        { value: CUSTOM_MODULE_VALUE, label: 'Otro (personalizado)…' },
    ]

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
            size={520}
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
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Vincule el workflow a un módulo y entidad. Luego embeba el panel de
                    cambio de estado en esa pantalla.
                </Text>

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

                    <Col span={24}>
                        <form.Field name="module">
                            {(field) => {
                                const known = getWorkflowModuleOptions().some(
                                    (opt) => opt.value === field.state.value,
                                )
                                const selectValue = known
                                    ? field.state.value
                                    : field.state.value
                                      ? CUSTOM_MODULE_VALUE
                                      : undefined

                                return (
                                    <Form.Item label="Módulo" required>
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccione módulo"
                                            options={moduleOptions}
                                            value={selectValue}
                                            onChange={(value) => {
                                                if (value === CUSTOM_MODULE_VALUE) {
                                                    field.handleChange('')
                                                } else {
                                                    field.handleChange(value)
                                                }
                                                form.setFieldValue('entityName', '')
                                            }}
                                        />
                                        {!known ? (
                                            <Input
                                                style={{ marginTop: 8 }}
                                                placeholder="Código técnico del módulo (ej. Pedidos)"
                                                value={field.state.value}
                                                onChange={(event) => {
                                                    field.handleChange(event.target.value)
                                                    form.setFieldValue('entityName', '')
                                                }}
                                            />
                                        ) : null}
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col span={24}>
                        <form.Subscribe selector={(state) => state.values.module}>
                            {(module) => {
                                const entityOptions = getWorkflowEntityOptions(module)

                                return (
                                    <form.Field name="entityName">
                                        {(field) => (
                                            <Form.Item label="Entidad" required>
                                                {entityOptions.length > 0 ? (
                                                    <Select
                                                        showSearch
                                                        optionFilterProp="label"
                                                        placeholder="Seleccione entidad"
                                                        options={entityOptions}
                                                        value={field.state.value || undefined}
                                                        onChange={(value) =>
                                                            field.handleChange(value)
                                                        }
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder="Nombre técnico de la entidad (ej. Orden)"
                                                        value={field.state.value}
                                                        onChange={(event) =>
                                                            field.handleChange(
                                                                event.target.value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Form.Item>
                                        )}
                                    </form.Field>
                                )
                            }}
                        </form.Subscribe>
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
                </Row>
            </Form>
        </Drawer>
    )
}
