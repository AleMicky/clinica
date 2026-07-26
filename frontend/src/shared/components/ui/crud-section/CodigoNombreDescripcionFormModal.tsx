import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal } from 'antd'

import {
    codigoNombreDescripcionDefaultValues,
    codigoNombreDescripcionSchema,
    type CodigoNombreDescripcionFormValues,
} from '../../../schemas/codigo-nombre-descripcion.schema'
import { getFieldError } from '../../../utils/form-errors'
import { normalizeCodigoInput } from '../../../utils/format-codigo'

type EntityLike = {
    codigo: string
    nombre: string
    descripcion?: string | null
}

type CodigoNombreDescripcionFormModalProps = {
    open: boolean
    entityLabel: string
    entity: EntityLike | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: CodigoNombreDescripcionFormValues) => Promise<void>
    codigoHelp?: string
    codigoPlaceholder?: string
    nombrePlaceholder?: string
}

export function CodigoNombreDescripcionFormModal({
    open,
    entityLabel,
    entity,
    loading,
    onClose,
    onSubmit,
    codigoHelp = 'Identificador único',
    codigoPlaceholder = 'Ej. CODIGO',
    nombrePlaceholder = 'Nombre descriptivo',
}: CodigoNombreDescripcionFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: codigoNombreDescripcionDefaultValues,
        validators: { onSubmit: codigoNombreDescripcionSchema },
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
            return
        }

        form.reset()
    }, [open, entity, form])

    return (
        <Modal
            title={isEditing ? `Editar ${entityLabel}` : `Nuevo ${entityLabel}`}
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
                                help={error || codigoHelp}
                            >
                                <Input
                                    placeholder={codigoPlaceholder}
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
                                    placeholder={nombrePlaceholder}
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

                <form.Field name="descripcion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Descripción"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Opcional"
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
