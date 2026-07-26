import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal } from 'antd'

import { getFieldError } from '../../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../../shared/utils/format-codigo'
import {
    unidadMedidaDefaultValues,
    unidadMedidaSchema,
    type UnidadMedidaFormValues,
} from '../schemas/unidades-medida.schema'
import type { UnidadMedida } from '../types/unidades-medida.types'

type UnidadMedidaFormModalProps = {
    open: boolean
    entity: UnidadMedida | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: UnidadMedidaFormValues) => Promise<void>
}

export function UnidadMedidaFormModal({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: UnidadMedidaFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: unidadMedidaDefaultValues,
        validators: { onSubmit: unidadMedidaSchema },
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
            form.setFieldValue('simbolo', entity.simbolo)
            return
        }

        form.reset()
    }, [open, entity, form])

    return (
        <Modal
            title={isEditing ? 'Editar unidad de medida' : 'Nueva unidad de medida'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={480}
        >
            <Form layout="vertical" requiredMark={false}>
                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Identificador único, ej. MG_DL'}
                            >
                                <Input
                                    placeholder="Ej. MG_DL"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(
                                            normalizeCodigoInput(e.target.value),
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
                                    placeholder="Miligramos por decilitro"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus={isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="simbolo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Símbolo"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Ej. mg/dL, %, U/L'}
                            >
                                <Input
                                    placeholder="mg/dL"
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
            </Form>
        </Modal>
    )
}
