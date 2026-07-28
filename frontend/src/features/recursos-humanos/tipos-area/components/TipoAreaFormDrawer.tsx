import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Input, InputNumber, Typography } from 'antd'

import { getFieldError } from '../../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../../shared/utils/format-codigo'
import {
    tipoAreaDefaultValues,
    tipoAreaSchema,
    type TipoAreaFormValues,
} from '../schemas/tipo-area.schema'
import type { TipoArea } from '../types/tipo-area.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type TipoAreaFormDrawerProps = {
    open: boolean
    entity: TipoArea | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: TipoAreaFormValues) => Promise<void>
}

export function TipoAreaFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: TipoAreaFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: tipoAreaDefaultValues,
        validators: { onSubmit: tipoAreaSchema },
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
            form.setFieldValue('orden', entity.orden)
            return
        }

        form.reset()
    }, [open, entity, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={isEditing ? 'Editar tipo de área' : 'Nuevo tipo de área'}
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void form.handleSubmit()}
                    >
                        {isEditing ? 'Guardar' : 'Crear'}
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                </Text>

                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Identificador único, ej. ADM'}
                            >
                                <Input
                                    placeholder="Ej. ADM"
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
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Administrativa"
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
                                help={error || undefined}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Opcional"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
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
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Posición en listados (0 = primero)'}
                            >
                                <InputNumber
                                    min={0}
                                    precision={0}
                                    style={{ width: '100%' }}
                                    value={field.state.value}
                                    onChange={(value) => field.handleChange(value ?? 0)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Drawer>
    )
}
