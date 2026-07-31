import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, InputNumber, Modal, Row, Select, Switch } from 'antd'

import { getFieldError } from '../../../../shared/utils/form-errors'
import {
    valorReferenciaDefaultValues,
    valorReferenciaSchema,
    type ValorReferenciaFormValues,
} from '../schemas/valor-referencia.schema'
import {
    VALOR_REFERENCIA_SEXO_OPTIONS,
    type ValorReferencia,
} from '../types/valor-referencia.types'

type ValorReferenciaFormModalProps = {
    open: boolean
    entity: ValorReferencia | null
    parametroLabel: string
    loading: boolean
    onClose: () => void
    onSubmit: (values: ValorReferenciaFormValues) => Promise<void>
}

export function ValorReferenciaFormModal({
    open,
    entity,
    parametroLabel,
    loading,
    onClose,
    onSubmit,
}: ValorReferenciaFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: valorReferenciaDefaultValues,
        validators: { onSubmit: valorReferenciaSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('sexo', entity.sexo ?? '')
            form.setFieldValue('edadMin', entity.edadMin ?? null)
            form.setFieldValue('edadMax', entity.edadMax ?? null)
            form.setFieldValue('valorMin', entity.valorMin ?? null)
            form.setFieldValue('valorMax', entity.valorMax ?? null)
            form.setFieldValue('valorTexto', entity.valorTexto ?? '')
            form.setFieldValue('activo', entity.activo)
            return
        }

        form.reset()
    }, [open, entity, form])

    return (
        <Modal
            title={
                isEditing
                    ? 'Editar valor de referencia'
                    : 'Nuevo valor de referencia'
            }
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={560}
        >
            <Form layout="vertical" requiredMark={false}>
                <Form.Item label="Parámetro">
                    <Input value={parametroLabel} disabled />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <form.Field name="sexo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Sexo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Vacío = aplica a todos'}
                                    >
                                        <Select
                                            allowClear
                                            placeholder="Todos"
                                            options={[...VALOR_REFERENCIA_SEXO_OPTIONS]}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="activo">
                            {(field) => (
                                <Form.Item label="Activo">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) =>
                                            field.handleChange(checked)
                                        }
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="edadMin">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Edad mínima"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="edadMax">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Edad máxima"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="valorMin">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Valor mínimo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="valorMax">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Valor máximo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="valorTexto">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Valor texto"
                                        validateStatus={error ? 'error' : undefined}
                                        help={
                                            error ||
                                            'Opcional. Para parámetros no numéricos.'
                                        }
                                    >
                                        <Input
                                            placeholder="Ej. Negativo"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
