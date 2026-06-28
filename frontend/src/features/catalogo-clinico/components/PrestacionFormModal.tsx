import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, InputNumber, Modal, Row, Switch } from 'antd'

import {
    prestacionDefaultValues,
    prestacionSchema,
    type PrestacionFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { Prestacion } from '../types/catalogo-clinico.types'

type PrestacionFormModalProps = {
    open: boolean
    prestacion: Prestacion | null
    servicioId: string | null
    servicioNombre?: string
    loading: boolean
    onClose: () => void
    onSubmit: (values: PrestacionFormValues) => Promise<void>
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

export function PrestacionFormModal({
    open,
    prestacion,
    servicioId,
    servicioNombre,
    loading,
    onClose,
    onSubmit,
}: PrestacionFormModalProps) {
    const isEditing = prestacion !== null

    const form = useForm({
        defaultValues: prestacionDefaultValues,
        validators: { onSubmit: prestacionSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (prestacion) {
            form.reset()
            form.setFieldValue('servicioId', prestacion.servicioId)
            form.setFieldValue('codigo', prestacion.codigo)
            form.setFieldValue('nombre', prestacion.nombre)
            form.setFieldValue('descripcion', prestacion.descripcion ?? '')
            form.setFieldValue('precio', prestacion.precio)
            form.setFieldValue('requiereOrdenMedica', prestacion.requiereOrdenMedica)
            form.setFieldValue('requiereMedico', prestacion.requiereMedico)
            return
        }

        form.reset()
        if (servicioId) {
            form.setFieldValue('servicioId', servicioId)
        }
    }, [open, prestacion, servicioId, form])

    return (
        <Modal
            title={isEditing ? 'Editar prestación' : 'Nueva prestación'}
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
                {servicioNombre ? (
                    <Form.Item label="Servicio">
                        <Input value={servicioNombre} disabled />
                    </Form.Item>
                ) : null}

                <Row gutter={16}>
                    <Col span={12}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Ej. HEMO, ECO"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value.toUpperCase())
                                            }
                                            disabled={loading || isEditing}
                                            autoFocus={!isEditing}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                    <Col span={12}>
                        <form.Field name="precio">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Precio (Bs.)"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            step={0.5}
                                            precision={2}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(Number(value ?? 0))
                                            }
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>

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
                                    placeholder="Nombre de la prestación"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="descripcion">
                    {(field) => (
                        <Form.Item label="Descripción">
                            <Input.TextArea
                                rows={2}
                                value={field.state.value ?? ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <Row gutter={24}>
                    <Col span={12}>
                        <form.Field name="requiereOrdenMedica">
                            {(field) => (
                                <Form.Item
                                    label="Requiere orden médica"
                                    valuePropName="checked"
                                >
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) => field.handleChange(checked)}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                    <Col span={12}>
                        <form.Field name="requiereMedico">
                            {(field) => (
                                <Form.Item label="Requiere médico" valuePropName="checked">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) => field.handleChange(checked)}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
