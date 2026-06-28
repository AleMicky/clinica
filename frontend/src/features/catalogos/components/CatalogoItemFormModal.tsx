import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, InputNumber, Modal } from 'antd'

import {
    catalogoItemDefaultValues,
    createCatalogoItemSchema,
    type CatalogoItemFormValues,
} from '../schemas/catalogo-item.schema'
import type { CatalogoGrupo, CatalogoItem } from '../types/catalogo.types'

type CatalogoItemFormModalProps = {
    open: boolean
    grupo: CatalogoGrupo | null
    item: CatalogoItem | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: CatalogoItemFormValues) => Promise<void>
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

export function CatalogoItemFormModal({
    open,
    grupo,
    item,
    loading,
    onClose,
    onSubmit,
}: CatalogoItemFormModalProps) {
    const isEditing = item !== null

    const form = useForm({
        defaultValues: catalogoItemDefaultValues,
        validators: { onSubmit: createCatalogoItemSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open || !grupo) return

        form.reset()

        if (item) {
            form.setFieldValue('catalogoGrupoId', item.catalogoGrupoId)
            form.setFieldValue('codigo', item.codigo)
            form.setFieldValue('nombre', item.nombre)
            form.setFieldValue('valor', item.valor)
            form.setFieldValue('orden', item.orden)
            return
        }

        form.setFieldValue('catalogoGrupoId', grupo.id)
        form.setFieldValue('orden', 1)
    }, [open, grupo, item, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={isEditing ? 'Editar ítem' : 'Nuevo ítem'}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                <Form.Item label="Grupo">
                    <Input value={grupo ? `${grupo.codigo} — ${grupo.nombre}` : ''} disabled />
                </Form.Item>

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
                                    placeholder="Ej. M, F, CI"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus
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
                                    placeholder="Nombre visible"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="valor">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Valor"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Valor almacenado"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="orden">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Orden"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    value={field.state.value}
                                    onChange={(value) =>
                                        field.handleChange(Number(value ?? 0))
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
