import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row } from 'antd'
import dayjs from 'dayjs'

import { getFieldError } from '../../../../shared/utils/form-errors'
import {
    pruebaPrecioDefaultValues,
    pruebaPrecioSchema,
    type PruebaPrecioFormValues,
} from '../schemas/prueba-precio.schema'
import type { PruebaPrecio } from '../types/prueba-precio.types'

const DATE_VALUE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'

type PruebaPrecioFormModalProps = {
    open: boolean
    entity: PruebaPrecio | null
    pruebaLabel: string
    loading: boolean
    onClose: () => void
    onSubmit: (values: PruebaPrecioFormValues) => Promise<void>
}

export function PruebaPrecioFormModal({
    open,
    entity,
    pruebaLabel,
    loading,
    onClose,
    onSubmit,
}: PruebaPrecioFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: pruebaPrecioDefaultValues,
        validators: { onSubmit: pruebaPrecioSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('importeFacturado', entity.importeFacturado)
            form.setFieldValue('costoLaboratorio', entity.costoLaboratorio)
            form.setFieldValue('costoDerivacion', entity.costoDerivacion)
            form.setFieldValue('fechaInicio', entity.fechaInicio)
            form.setFieldValue('fechaFin', entity.fechaFin ?? '')
            form.setFieldValue('motivoCambio', entity.motivoCambio)
            return
        }

        form.reset()
        form.setFieldValue('fechaInicio', dayjs().format(DATE_VALUE_FORMAT))
    }, [open, entity, form])

    return (
        <Modal
            title={isEditing ? 'Editar precio' : 'Nuevo precio'}
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
                <Form.Item label="Prueba">
                    <Input value={pruebaLabel} disabled />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <form.Field name="importeFacturado">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Importe facturado"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            precision={2}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value ?? 0)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={8}>
                        <form.Field name="costoLaboratorio">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Costo laboratorio"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            precision={2}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value ?? 0)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={8}>
                        <form.Field name="costoDerivacion">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Costo derivación"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            precision={2}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value ?? 0)
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
                        <form.Field name="fechaInicio">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Fecha inicio"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format={DATE_DISPLAY_FORMAT}
                                            value={
                                                field.state.value
                                                    ? dayjs(
                                                          field.state.value,
                                                          DATE_VALUE_FORMAT,
                                                      )
                                                    : null
                                            }
                                            onChange={(date) =>
                                                field.handleChange(
                                                    date
                                                        ? date.format(DATE_VALUE_FORMAT)
                                                        : '',
                                                )
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
                        <form.Field name="fechaFin">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Fecha fin"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Vacío = vigente'}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format={DATE_DISPLAY_FORMAT}
                                            allowClear
                                            value={
                                                field.state.value
                                                    ? dayjs(
                                                          field.state.value,
                                                          DATE_VALUE_FORMAT,
                                                      )
                                                    : null
                                            }
                                            onChange={(date) =>
                                                field.handleChange(
                                                    date
                                                        ? date.format(DATE_VALUE_FORMAT)
                                                        : '',
                                                )
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
                        <form.Field name="motivoCambio">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Motivo del cambio"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input.TextArea
                                            rows={3}
                                            placeholder="Ej. Ajuste tarifario 2026"
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
