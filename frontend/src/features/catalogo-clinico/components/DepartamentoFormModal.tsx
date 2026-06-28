import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal, Select } from 'antd'

import {
    departamentoDefaultValues,
    departamentoSchema,
    type DepartamentoFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { Area, Departamento } from '../types/catalogo-clinico.types'

type DepartamentoFormModalProps = {
    open: boolean
    departamento: Departamento | null
    areas: Area[]
    defaultAreaId?: string | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: DepartamentoFormValues) => Promise<void>
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

export function DepartamentoFormModal({
    open,
    departamento,
    areas,
    defaultAreaId,
    loading,
    onClose,
    onSubmit,
}: DepartamentoFormModalProps) {
    const isEditing = departamento !== null

    const form = useForm({
        defaultValues: departamentoDefaultValues,
        validators: { onSubmit: departamentoSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (departamento) {
            form.reset()
            form.setFieldValue('areaId', departamento.areaId)
            form.setFieldValue('codigo', departamento.codigo)
            form.setFieldValue('nombre', departamento.nombre)
            form.setFieldValue('descripcion', departamento.descripcion ?? '')
            return
        }

        form.reset()
        if (defaultAreaId) {
            form.setFieldValue('areaId', defaultAreaId)
        }
    }, [open, departamento, defaultAreaId, form])

    return (
        <Modal
            title={isEditing ? 'Editar departamento' : 'Nuevo departamento'}
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
                <form.Field name="areaId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Área"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Select
                                    showSearch
                                    placeholder="Seleccione área"
                                    optionFilterProp="label"
                                    value={field.state.value || undefined}
                                    onChange={(value) => field.handleChange(value)}
                                    disabled={
                                        loading ||
                                        Boolean(defaultAreaId && !isEditing)
                                    }
                                    options={areas.map((area) => ({
                                        value: area.id,
                                        label: `${area.nombre} (${area.codigo})`,
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
                                    placeholder="Ej. EMER, PED"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value.toUpperCase())
                                    }
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
                                    disabled={loading}
                                    autoFocus={isEditing}
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
