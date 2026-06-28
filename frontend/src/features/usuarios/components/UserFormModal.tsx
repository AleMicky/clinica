import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal, Select, Switch } from 'antd'

import {
    createUserDefaultValues,
    createUserSchema,
    updateUserDefaultValues,
    updateUserSchema,
    type CreateUserFormValues,
    type UpdateUserFormValues,
} from '../schemas/user.schema'
import type { User } from '../types/user.types'

type UserFormModalProps = {
    open: boolean
    user: User | null
    roleOptions: string[]
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateUserFormValues) => Promise<void>
    onUpdate: (values: UpdateUserFormValues) => Promise<void>
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

export function UserFormModal({
    open,
    user,
    roleOptions,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: UserFormModalProps) {
    const isEditing = user !== null

    const createForm = useForm({
        defaultValues: createUserDefaultValues,
        validators: {
            onSubmit: createUserSchema,
        },
        onSubmit: async ({ value }) => {
            await onCreate(value)
        },
    })

    const updateForm = useForm({
        defaultValues: updateUserDefaultValues,
        validators: {
            onSubmit: updateUserSchema,
        },
        onSubmit: async ({ value }) => {
            await onUpdate(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (user) {
            updateForm.reset()
            updateForm.setFieldValue('nombreCompleto', user.nombreCompleto)
            updateForm.setFieldValue('activo', user.activo)
            return
        }

        createForm.reset()
    }, [open, user, createForm, updateForm])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleSubmit = () => {
        if (isEditing) {
            void updateForm.handleSubmit()
            return
        }

        void createForm.handleSubmit()
    }

    const roleSelectOptions = roleOptions.map((role) => ({
        label: role,
        value: role,
    }))

    return (
        <Modal
            title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                {!isEditing ? (
                    <>
                        <createForm.Field name="userName">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Usuario"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="admin"
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
                        </createForm.Field>

                        <createForm.Field name="nombreCompleto">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Nombre completo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Nombre y apellidos"
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
                        </createForm.Field>

                        <createForm.Field name="password">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Contraseña"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input.Password
                                            placeholder="Mínimo 6 caracteres"
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
                        </createForm.Field>

                        <createForm.Field name="rol">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Rol"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            placeholder="Seleccione un rol"
                                            options={roleSelectOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </createForm.Field>
                    </>
                ) : (
                    <>
                        <Form.Item label="Usuario">
                            <Input value={user?.userName} disabled />
                        </Form.Item>

                        <Form.Item label="Rol">
                            <Input value={user?.roles.join(', ')} disabled />
                        </Form.Item>

                        <updateForm.Field name="nombreCompleto">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Nombre completo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Nombre y apellidos"
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
                        </updateForm.Field>

                        <updateForm.Field name="activo">
                            {(field) => (
                                <Form.Item label="Estado">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) => field.handleChange(checked)}
                                        checkedChildren="Activo"
                                        unCheckedChildren="Inactivo"
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </updateForm.Field>
                    </>
                )}
            </Form>
        </Modal>
    )
}
