import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal } from 'antd'

import {
    catalogoBaseDefaultValues,
    catalogoBaseSchema,
    type CatalogoBaseFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { CatalogoBase } from '../types/catalogo-clinico.types'

type CatalogoBaseFormModalProps = {
    open: boolean
    entityLabel: string
    entity: CatalogoBase | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: CatalogoBaseFormValues) => Promise<void>
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

export function CatalogoBaseFormModal({
    open,
    entityLabel,
    entity,
    loading,
    onClose,
    onSubmit,
}: CatalogoBaseFormModalProps) {
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: catalogoBaseDefaultValues,
        validators: { onSubmit: catalogoBaseSchema },
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
