import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, Modal, Row, Select, Space } from 'antd'

import {
    DEFAULT_TIPO_ATENCION_COLOR,
    DEFAULT_TIPO_ATENCION_ICONO,
    TIPO_ATENCION_ICON_OPTIONS,
} from '../constants/tipo-atencion-icons'
import {
    tipoAtencionFormDefaultValues,
    tipoAtencionFormSchema,
    type TipoAtencionFormValues,
} from '../schemas/tipo-atencion.schema'
import type { TipoAtencion } from '../types/atencion-medica.types'

type TipoAtencionFormModalProps = {
    open: boolean
    entity: TipoAtencion | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: TipoAtencionFormValues) => Promise<void>
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

export function TipoAtencionFormModal({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: TipoAtencionFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: tipoAtencionFormDefaultValues,
        validators: { onSubmit: tipoAtencionFormSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('codigo', entity.codigo)
            form.setFieldValue('nombre', entity.nombre)
            form.setFieldValue('descripcion', entity.descripcion ?? '')
            form.setFieldValue('color', entity.color || DEFAULT_TIPO_ATENCION_COLOR)
            form.setFieldValue('icono', entity.icono || DEFAULT_TIPO_ATENCION_ICONO)
            return
        }

        form.reset()
    }, [open, entity, form])

    return (
        <Modal
            title={isEditing ? 'Editar tipo de atención' : 'Nuevo tipo de atención'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={520}
        >
            <Form layout="vertical" requiredMark={false} className="tipo-atencion-form">
                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Identificador único, ej. CARD, LAB01'}
                            >
                                <Input
                                    placeholder="Ej. EMER, CARD"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/\s+/g, '_'),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading || isEditing}
                                    autoFocus={!isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="nombre">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Nombre"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Nombre descriptivo"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus={isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <Row gutter={12}>
                    <Col span={12}>
                        <form.Field name="color">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Color"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            type="color"
                                            className="tipo-atencion-form__color-input"
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
                    <Col span={12}>
                        <form.Field name="icono">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Icono"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            value={field.state.value}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                            optionLabelProp="label"
                                            options={TIPO_ATENCION_ICON_OPTIONS.map(
                                                (option) => ({
                                                    value: option.value,
                                                    label: (
                                                        <Space size={8}>
                                                            <option.Icon />
                                                            <span>{option.label}</span>
                                                        </Space>
                                                    ),
                                                }),
                                            )}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>

                <form.Field name="descripcion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Descripción"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Opcional'}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Detalle adicional…"
                                    value={field.state.value ?? ''}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Modal>
    )
}
