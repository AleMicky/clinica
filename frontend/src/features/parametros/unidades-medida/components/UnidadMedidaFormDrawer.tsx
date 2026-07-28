import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Input, Typography } from 'antd'

import { getFieldError } from '../../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../../shared/utils/format-codigo'
import {
    unidadMedidaDefaultValues,
    unidadMedidaSchema,
    type UnidadMedidaFormValues,
} from '../schemas/unidades-medida.schema'
import type { UnidadMedida } from '../types/unidades-medida.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type UnidadMedidaFormDrawerProps = {
    open: boolean
    entity: UnidadMedida | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: UnidadMedidaFormValues) => Promise<void>
}

export function UnidadMedidaFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: UnidadMedidaFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
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

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={isEditing ? 'Editar unidad de medida' : 'Nueva unidad de medida'}
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
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Miligramos por decilitro"
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

                <form.Field name="simbolo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Símbolo"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Ej. mg/dL, %, U/L'}
                            >
                                <Input
                                    placeholder="mg/dL"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
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
