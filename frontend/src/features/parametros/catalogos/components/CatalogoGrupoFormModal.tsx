import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal } from 'antd'

import {
    createCatalogoGrupoDefaultValues,
    createCatalogoGrupoSchema,
    updateCatalogoGrupoDefaultValues,
    updateCatalogoGrupoSchema,
    type CreateCatalogoGrupoFormValues,
    type UpdateCatalogoGrupoFormValues,
} from '../schemas/catalogo-grupo.schema'
import type { CatalogoGrupo } from '../types/catalogo.types'

type CatalogoGrupoFormModalProps = {
    open: boolean
    grupo: CatalogoGrupo | null
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateCatalogoGrupoFormValues) => Promise<void>
    onUpdate: (values: UpdateCatalogoGrupoFormValues) => Promise<void>
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

export function CatalogoGrupoFormModal({
    open,
    grupo,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: CatalogoGrupoFormModalProps) {
    const isEditing = grupo !== null

    const createForm = useForm({
        defaultValues: createCatalogoGrupoDefaultValues,
        validators: { onSubmit: createCatalogoGrupoSchema },
        onSubmit: async ({ value }) => {
            await onCreate(value)
        },
    })

    const updateForm = useForm({
        defaultValues: updateCatalogoGrupoDefaultValues,
        validators: { onSubmit: updateCatalogoGrupoSchema },
        onSubmit: async ({ value }) => {
            await onUpdate(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (grupo) {
            updateForm.reset()
            updateForm.setFieldValue('nombre', grupo.nombre)
            updateForm.setFieldValue('descripcion', grupo.descripcion)
            return
        }

        createForm.reset()
    }, [open, grupo, createForm, updateForm])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={isEditing ? 'Editar grupo de catálogo' : 'Nuevo grupo de catálogo'}
            open={open}
            onCancel={handleClose}
            onOk={() =>
                void (isEditing ? updateForm.handleSubmit() : createForm.handleSubmit())
            }
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                {!isEditing ? (
                    <>
                        <createForm.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Ej. SEXO, TIPO_DOCUMENTO"
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

                        <createForm.Field name="nombre">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Nombre"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Nombre del catálogo"
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

                        <createForm.Field name="descripcion">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Descripción"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input.TextArea
                                            placeholder="Descripción opcional"
                                            rows={3}
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
                    </>
                ) : (
                    <>
                        <Form.Item label="Código">
                            <Input value={grupo.codigo} disabled />
                        </Form.Item>

                        <updateForm.Field name="nombre">
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

                        <updateForm.Field name="descripcion">
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
                        </updateForm.Field>
                    </>
                )}
            </Form>
        </Modal>
    )
}
