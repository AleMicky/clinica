import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal, Select } from 'antd'

import {
    servicioDefaultValues,
    servicioSchema,
    type ServicioFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { Departamento, Servicio } from '../types/catalogo-clinico.types'

type ServicioFormModalProps = {
    open: boolean
    servicio: Servicio | null
    departamentos: Departamento[]
    defaultDepartamentoId?: string | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: ServicioFormValues) => Promise<void>
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

export function ServicioFormModal({
    open,
    servicio,
    departamentos,
    defaultDepartamentoId,
    loading,
    onClose,
    onSubmit,
}: ServicioFormModalProps) {
    const isEditing = servicio !== null

    const form = useForm({
        defaultValues: servicioDefaultValues,
        validators: { onSubmit: servicioSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (servicio) {
            form.reset()
            form.setFieldValue('departamentoId', servicio.departamentoId)
            form.setFieldValue('codigo', servicio.codigo)
            form.setFieldValue('nombre', servicio.nombre)
            form.setFieldValue('descripcion', servicio.descripcion ?? '')
            return
        }

        form.reset()
        if (defaultDepartamentoId) {
            form.setFieldValue('departamentoId', defaultDepartamentoId)
        }
    }, [open, servicio, defaultDepartamentoId, form])

    return (
        <Modal
            title={isEditing ? 'Editar servicio' : 'Nuevo servicio'}
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
            <Form layout="vertical" requiredMark={false}>
                <form.Field name="departamentoId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Departamento"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Select
                                    showSearch
                                    placeholder="Seleccione departamento"
                                    optionFilterProp="label"
                                    value={field.state.value || undefined}
                                    onChange={(value) => field.handleChange(value)}
                                    disabled={loading || Boolean(defaultDepartamentoId && !isEditing)}
                                    options={departamentos.map((d) => ({
                                        value: d.id,
                                        label: `${d.nombre} (${d.codigo})`,
                                    }))}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

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
                                    placeholder="Ej. LAB, RX"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                    onBlur={field.handleBlur}
                                    disabled={loading || isEditing}
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
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
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
            </Form>
        </Modal>
    )
}
