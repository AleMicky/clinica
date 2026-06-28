import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal } from 'antd'

import {
    roleDefaultValues,
    roleSchema,
    type RoleFormValues,
} from '../schemas/role.schema'
import type { Role } from '../types/role.types'

type RoleFormModalProps = {
    open: boolean
    role: Role | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: RoleFormValues) => Promise<void>
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

export function RoleFormModal({
    open,
    role,
    loading,
    onClose,
    onSubmit,
}: RoleFormModalProps) {
    const isEditing = role !== null

    const form = useForm({
        defaultValues: roleDefaultValues,
        validators: {
            onSubmit: roleSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()
        form.setFieldValue('name', role?.name ?? '')
        form.setFieldValue('descripcion', role?.descripcion ?? '')
    }, [open, role, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={isEditing ? 'Editar rol' : 'Nuevo rol'}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                <form.Field name="name">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Nombre"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Ej. Administrador, Medico"
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
                                    placeholder="Descripción opcional del rol"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    rows={3}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Modal>
    )
}
