import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Input, Switch, Typography } from 'antd'

import { getFieldError } from '../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../shared/utils/format-codigo'
import {
    metodoPagoDefaultValues,
    metodoPagoSchema,
    type MetodoPagoFormValues,
} from '../schemas/metodo-pago.schema'
import type { MetodoPago } from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type MetodoPagoFormDrawerProps = {
    open: boolean
    entity: MetodoPago | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: MetodoPagoFormValues) => Promise<void>
}

export function MetodoPagoFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: MetodoPagoFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: metodoPagoDefaultValues,
        validators: { onSubmit: metodoPagoSchema },
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
            form.setFieldValue('requiereReferencia', entity.requiereReferencia)
            form.setFieldValue('esEfectivo', entity.esEfectivo)
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
            title={isEditing ? 'Editar método de pago' : 'Nuevo método de pago'}
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
                                help={error || 'Identificador único, ej. EFECTIVO'}
                            >
                                <Input
                                    placeholder="Ej. QR"
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
                                    placeholder="Transferencia"
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

                <form.Field name="requiereReferencia">
                    {(field) => (
                        <Form.Item
                            label="Requiere referencia"
                            help="Pide número de operación, voucher o similar"
                        >
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="esEfectivo">
                    {(field) => (
                        <Form.Item
                            label="Es efectivo"
                            help="Se incluye en el conteo de efectivo del arqueo"
                        >
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>
            </Form>
        </Drawer>
    )
}
